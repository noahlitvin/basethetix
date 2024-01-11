import { BigNumberish, Contract } from 'ethers';
import { useCallback, useState } from 'react';
import { useAccount, Address, useWalletClient, usePublicClient } from 'wagmi';
import { EIP7412 } from 'erc7412';
import { PythAdapter } from 'erc7412/dist/src/adapters/pyth';
import * as viem from 'viem';
import { useContract } from './useContract';
import { waitForTransaction } from 'wagmi/actions';
import { GAS_PRICE } from '../constants/gasPrices';

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
    async (data: string, to: string, value?: BigNumberish | undefined) => {
      if (!walletClient) {
        return;
      }

      setIsLoading(true);
      try {
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
          publicClient,
          multicallFunc,
          {
            account: account.address,
            to: to as Address,
            data: data as Address,
            value: value as bigint,
          }
        );

        let gas = GAS_PRICE;
        try {
          gas = await publicClient.estimateGas({
            account: account.address as Address,
            to: txn.to,
            data: txn.data as Address,
            value: txn.value as bigint,
          });
        } catch (error) {}
        gas = (gas * 11n) / 10n;

        const hash = await walletClient?.sendTransaction({
          to: txn.to as Address,
          data: txn.data,
          value: txn.value,
          gas,
        });

        await waitForTransaction({
          hash,
          confirmations: 2,
        });

        setIsLoading(false);
      } catch (error: any) {
        console.log('error in useTransact!', error?.data);
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
