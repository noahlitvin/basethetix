import { ethers } from 'ethers';
import { TransactionRequest } from 'viem';
import TrustedMulticallForwarder from '../deployments/system/trusted_multicall_forwarder/TrustedMulticallForwarder.json';
import { Address } from 'wagmi';

export const multicallInterface = new ethers.utils.Interface(
  TrustedMulticallForwarder.abi
);

export function makeMulticall(
  calls: TransactionRequest[],
  senderAddr: string
): TransactionRequest {
  const encodedData = multicallInterface.encodeFunctionData('aggregate3Value', [
    calls.map((call) => ({
      target: call.to,
      callData: call.data,
      value: call.value || ethers.BigNumber.from(0),
      requireSuccess: true,
    })),
  ]);

  let totalValue = ethers.BigNumber.from(0);
  for (const call of calls) {
    totalValue = totalValue.add(call.value || ethers.BigNumber.from(0));
  }

  return {
    from: senderAddr as Address,
    to: TrustedMulticallForwarder.address as Address,
    data: encodedData as Address,
    value: BigInt(totalValue.toString()),
  };
}
