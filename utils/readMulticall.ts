import { ethers, Contract } from 'ethers';
import * as viem from 'viem';
import {
  TransactionRequest,
  generate7412CompatibleCall,
} from '../hooks/useTransact';
import { Address } from 'wagmi';

export const MulticallABI = [
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'target',
            type: 'address',
          },
          {
            internalType: 'bool',
            name: 'requireSuccess',
            type: 'bool',
          },
          {
            internalType: 'uint256',
            name: 'value',
            type: 'uint256',
          },
          {
            internalType: 'bytes',
            name: 'callData',
            type: 'bytes',
          },
        ],
        internalType: 'struct TrustedMulticallForwarder.Call3Value[]',
        name: 'calls',
        type: 'tuple[]',
      },
    ],
    name: 'aggregate3Value',
    outputs: [
      {
        components: [
          {
            internalType: 'bool',
            name: 'success',
            type: 'bool',
          },
          {
            internalType: 'bytes',
            name: 'returnData',
            type: 'bytes',
          },
        ],
        internalType: 'struct TrustedMulticallForwarder.Result[]',
        name: 'returnData',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
];

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

    const multicallFunc = function makeMulticallCall(
      calls: TransactionRequest[]
    ): TransactionRequest {
      const ret = viem.encodeFunctionData({
        abi: MulticallABI,
        functionName: 'aggregate3Value',
        args: [
          calls.map((call) => ({
            target: call.to,
            callData: call.data,
            value: call.value || 0n,
            requireSuccess: true,
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
        data: ret,
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
        abi: MulticallABI,
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
