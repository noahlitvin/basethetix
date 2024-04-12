import { PublicClient } from 'viem';
import { TransactionRequest } from '../hooks/useTransact';
import { EIP7412 } from 'erc7412';
import { PythAdapter } from 'erc7412/dist/src/adapters/pyth';

export async function generate7412CompatibleCall(
  client: PublicClient,
  multicallFunc: (txs: TransactionRequest[]) => TransactionRequest,
  txn: TransactionRequest | TransactionRequest[]
) {
  const adapters = [];

  // NOTE: add other providers here as needed
  adapters.push(new PythAdapter('https://hermes.pyth.network/'));

  const converter = new EIP7412(adapters, multicallFunc);
  return await converter.enableERC7412(client as any, txn);
}
