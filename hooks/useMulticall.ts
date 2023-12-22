import { useCallback } from 'react';
import { ethers } from 'ethers';
import { TransactionRequest } from 'viem';
import { Address, useAccount, usePublicClient } from 'wagmi';
import { useContract } from './useContract';
import TrustedMulticallForwarderABI from '../deployments/system/trusted_multicall_forwarder/TrustedMulticallForwarder.json';

export const multicallInterface = new ethers.utils.Interface(
  TrustedMulticallForwarderABI.abi
);

export const useMulticall = () => {
  const TrustedMulticallForwarder = useContract('TrustedMulticallForwarder');
  const publicClient = usePublicClient();
  const { address } = useAccount();

  const makeMulticall = useCallback(
    async (calls: TransactionRequest[], senderAddr: string) => {
      const encodedData = multicallInterface.encodeFunctionData(
        'aggregate3Value',
        [
          calls.map((call) => ({
            target: call.to,
            callData: call.data,
            value: call.value || ethers.BigNumber.from(0),
            requireSuccess: true,
          })),
        ]
      );

      let totalValue = ethers.BigNumber.from(0);
      let gasEstimate = 0n;
      for (const call of calls) {
        totalValue = totalValue.add(call.value || ethers.BigNumber.from(0));
        try {
          const estimate = await publicClient.estimateGas({
            account: address as Address,
            to: call.to,
            data: call.data,
            value: call.value,
          });
          gasEstimate += estimate;
        } catch (error) {
          gasEstimate += 10000n;
        }
      }

      return {
        from: senderAddr as Address,
        to: TrustedMulticallForwarder.address as Address,
        data: encodedData as Address,
        value: BigInt(totalValue.toString()),
        gas: (gasEstimate * 11n) / 10n,
      } as TransactionRequest;
    },
    [TrustedMulticallForwarder.address, address, publicClient]
  );

  return {
    makeMulticall,
  };
};
