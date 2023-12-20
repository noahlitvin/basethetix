import { EIP7412 } from 'erc7412';
import { PythAdapter } from 'erc7412/dist/src/adapters/pyth';
import { PublicClient } from 'viem';
import { TransactionRequest } from '../hooks/useTransact';

export const MulticallThroughAbi = [
  {
    inputs: [
      {
        internalType: 'address[]',
        name: 'to',
        type: 'address[]',
      },
      {
        internalType: 'bytes[]',
        name: 'data',
        type: 'bytes[]',
      },
      {
        internalType: 'uint256[]',
        name: 'values',
        type: 'uint256[]',
      },
    ],
    name: 'multicallThrough',
    outputs: [
      {
        internalType: 'bytes[]',
        name: 'results',
        type: 'bytes[]',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
];

export async function generate7412CompatibleCall(
  client: PublicClient,
  multicallFunc: (txs: TransactionRequest[]) => TransactionRequest,
  txn: TransactionRequest
) {
  const adapters = [];

  // NOTE: add other providers here as needed
  adapters.push(new PythAdapter('https://hermes.pyth.network/'));

  const converter = new EIP7412(adapters, multicallFunc);

  return await converter.enableERC7412(client as any, txn);
}
