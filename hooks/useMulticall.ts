import { useCallback } from 'react';
import { ethers } from 'ethers';
import { TransactionRequest } from 'viem';
import { Address, usePublicClient } from 'wagmi';
import { useContract } from './useContract';
import TrustedMulticallForwarderABI from '../deployments/system/trusted_multicall_forwarder/TrustedMulticallForwarder.json';
import { GAS_PRICE } from '../constants/gasPrices';

export const multicallInterface = new ethers.utils.Interface(
  TrustedMulticallForwarderABI.abi
);

export const useMulticall = () => {
  const TrustedMulticallForwarder = useContract('TrustedMulticallForwarder');
  const publicClient = usePublicClient();

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
      for (const call of calls) {
        totalValue = totalValue.add(call.value || ethers.BigNumber.from(0));
      }

      let gas = GAS_PRICE;
      try {
        gas = await publicClient.estimateGas({
          account: senderAddr as Address,
          to: TrustedMulticallForwarder.address as Address,
          data: encodedData as Address,
          value: BigInt(totalValue.toString()),
        });
      } catch (error) {}

      return {
        from: senderAddr as Address,
        to: TrustedMulticallForwarder.address as Address,
        data: encodedData as Address,
        value: BigInt(totalValue.toString()),
        gas: (gas * 11n) / 10n,
      } as TransactionRequest;
    },
    [TrustedMulticallForwarder.address, publicClient]
  );

  return {
    makeMulticall,
  };
};
