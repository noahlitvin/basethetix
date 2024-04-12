import { ethers, Contract } from 'ethers';
import * as viem from 'viem';
import { TransactionRequest } from '../hooks/useTransact';
import { Address } from 'wagmi';
import { generate7412CompatibleCall } from './erc7412';
import BaseTrustedMulticallForwarder from '../deployments/base/system/trusted_multicall_forwarder/TrustedMulticallForwarder.json';

export const readMulticall = async (
  multiCallAddress: string,
  abi: any,
  address: string,
  fn: string,
  args: Array<any>,
  publicClient: any,
  account: `0x${string}` | undefined,
  value?: bigint | undefined
) => {
  try {
    const contract = new Contract(address, abi);
    const data = contract.interface.encodeFunctionData(fn, args);

    const multicallFunc = function makeMulticallThroughCall(
      calls: TransactionRequest[]
    ): TransactionRequest {
      const multicallData = viem.encodeFunctionData({
        abi: BaseTrustedMulticallForwarder.abi,
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
        account: account,
        to: multiCallAddress as Address,
        data: multicallData,
        value: totalValue,
      };
    };

    const txn = await generate7412CompatibleCall(publicClient, multicallFunc, {
      account: account as Address,
      to: contract.address as Address,
      data: data as Address,
      value,
    });

    const result = await publicClient.call({
      account: '0x4200000000000000000000000000000000000006', // simulate w/ wETH contract because it will have eth
      data: txn.data,
      to: txn.to,
      value: txn.value,
    });

    try {
      const decodedFunctionResult = viem.decodeFunctionResult({
        abi: BaseTrustedMulticallForwarder.abi,
        functionName: 'aggregate3Value',
        data: result.data!,
      }) as any[];

      const decodedFunctionResult2 = viem.decodeFunctionResult({
        abi: JSON.parse(
          contract.interface.format(ethers.utils.FormatTypes.json).toString()
        ),
        functionName: fn,
        data:
          decodedFunctionResult[decodedFunctionResult.length - 1]?.returnData ||
          '0x0000000000000000000000000000000000000000000000000000000000000000',
      });

      return decodedFunctionResult2;
    } catch (error) {
      const decodedFunctionResult = viem.decodeFunctionResult({
        abi: abi,
        functionName: fn,
        data: result.data!,
      }) as any[];

      return decodedFunctionResult;
    }
  } catch (error) {
    throw error;
  }
};
