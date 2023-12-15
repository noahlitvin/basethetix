import { useCallback } from 'react';
import { ethers } from 'ethers';
import { TransactionRequest } from 'viem';
import { Address } from 'wagmi';
import { useContract } from './useContract';
import TrustedMulticallForwarderABI from '../deployments/system/trusted_multicall_forwarder/TrustedMulticallForwarder.json';

export const multicallInterface = new ethers.utils.Interface(
  TrustedMulticallForwarderABI.abi
);

export const useMulticall = () => {
  const TrustedMulticallForwarder = useContract('TrustedMulticallForwarder');
  const makeMulticall = useCallback(
    (calls: TransactionRequest[], senderAddr: string) => {
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
      for (const call of calls) {
        totalValue = totalValue.add(call.value || ethers.BigNumber.from(0));
      }

      return {
        from: senderAddr as Address,
        to: TrustedMulticallForwarder.address as Address,
        data: encodedData as Address,
        value: BigInt(totalValue.toString()),
      } as TransactionRequest;
    },
    [TrustedMulticallForwarder.address]
  );

  return {
    makeMulticall,
  };
};
