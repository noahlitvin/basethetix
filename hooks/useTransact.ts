import { BigNumberish, Contract } from 'ethers';
import { useCallback, useState } from 'react';
import { useAccount, Address, useWalletClient, usePublicClient } from 'wagmi';
import { EIP7412 } from 'erc7412';
import { PythAdapter } from 'erc7412/dist/src/adapters/pyth';
import * as viem from 'viem';
import { useContract } from './useContract';
import { waitForTransaction } from 'wagmi/actions';

export type TransactionRequest = {
  to?: Address | null | undefined;
  data?: Address | undefined;
  value?: bigint | undefined;
  account?: Address | undefined;
};

export async function generate7412CompatibleCall(
  client: viem.PublicClient,
  multicallFunc: (txs: TransactionRequest[]) => TransactionRequest,
  txn: TransactionRequest
) {
  const adapters = [];

  // NOTE: add other providers here as needed
  adapters.push(new PythAdapter('https://hermes.pyth.network/'));

  const converter = new EIP7412(adapters, multicallFunc);
  return await converter.enableERC7412(client as any, txn);
}

export const useTransact = () => {
  const [isLoading, setIsLoading] = useState(false);
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const account = useAccount();
  const TrustedMulticallForwarder = useContract('TrustedMulticallForwarder');

  const transact = useCallback(
    async (
      contract: Contract,
      fn: string,
      args: Array<any>,
      value?: BigNumberish | undefined
    ) => {
      if (!walletClient) {
        return;
      }

      setIsLoading(true);
      try {
        // const feeData = await provider.getFeeData();
        const data = contract.interface.encodeFunctionData(fn, args);

        const viemClient = viem.createPublicClient({
          transport: viem.custom({
            request: ({ method, params }) =>
              (publicClient as any).send(method, params),
          }),
        });

        const multicallFunc = function makeMulticallThroughCall(
          calls: TransactionRequest[]
        ): TransactionRequest {
          const multicallData = viem.encodeFunctionData({
            abi: TrustedMulticallForwarder.abi,
            functionName: 'aggregate3Value',
            args: [
              calls.map((c) => ({
                target: c.to,
                requireSuccess: true,
                value: c.value || 0n,
                callData: c.data,
              })),
            ],
          });

          let totalValue = 0n;
          for (const call of calls) {
            totalValue += call.value || 0n;
          }

          return {
            account: account.address,
            to: TrustedMulticallForwarder.address as Address,
            data: multicallData,
            value: totalValue,
          };
        };

        const txn = await generate7412CompatibleCall(
          viemClient,
          multicallFunc,
          {
            account: account.address,
            to: contract.address as Address,
            data: data as Address,
            value: value as bigint,
          }
        );
        // const gas = await walletClient.({
        //   to: txn.to as Address,
        //   data: txn.data,
        //   value: txn.value,
        // });
        // const gasLimit = (Number(gas) * 1.2).toFixed(0);

        const hash = await walletClient?.sendTransaction({
          to: txn.to as Address,
          data: txn.data,
          value: txn.value,
          /*
          maxFeePerGas: feeData.maxFeePerGas || undefined,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || undefined,
          type: 2,
          */
        });

        await waitForTransaction({
          hash,
          confirmations: 2,
        });
        setIsLoading(false);
      } catch (error) {
        console.log('error in useTransact!', error);
        setIsLoading(false);
        throw error;
      }
    },
    [
      TrustedMulticallForwarder.abi,
      TrustedMulticallForwarder.address,
      account.address,
      publicClient,
      walletClient,
    ]
  );

  return {
    transact,
    isLoading,
  };
};
