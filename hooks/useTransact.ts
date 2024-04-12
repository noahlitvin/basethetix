import { useCallback, useState } from 'react';
import { useAccount, Address, useWalletClient, usePublicClient } from 'wagmi';
import * as viem from 'viem';
import { useContract } from './useContract';
import { waitForTransaction } from 'wagmi/actions';
import { GAS_PRICE } from '../constants/gasPrices';
import { generate7412CompatibleCall } from '../utils/erc7412';
import { parseError } from '../utils/parseError';

export type TransactionRequest = {
  to?: Address | null | undefined;
  data?: Address | undefined;
  value?: bigint | undefined;
  account?: Address | undefined;
};

export const useTransact = () => {
  const [isLoading, setIsLoading] = useState(false);
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const account = useAccount();
  const TrustedMulticallForwarder = useContract('TrustedMulticallForwarder');

  const transact = useCallback(
    async (transactions: TransactionRequest[], abi?: any) => {
      if (!walletClient) {
        return;
      }

      transactions.forEach((tx) => (tx.account = account.address));

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
          transactions
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
        const parsedError = parseError(error);
        if (parsedError && abi) {
          try {
            const errorResult = viem.decodeErrorResult({
              abi,
              data: parsedError,
            });
            console.log('error: ', errorResult.errorName, errorResult.args);
          } catch (_error) {}
        }
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
