import { BigNumberish } from 'ethers';
import { useAccount, usePublicClient, useQuery } from 'wagmi';
import { readMulticall } from '../utils/readMulticall';
import { useContract } from './useContract';

export const useMulticallRead = <T = any>(
  abi: any,
  address: string,
  fn: string,
  args: Array<any>,
  defaultValue?: BigNumberish | undefined
): {
  data: T | undefined;
  isLoading: boolean;
  refetch: () => void;
} => {
  const account = useAccount();

  const TrustedMulticallForwarder = useContract('TrustedMulticallForwarder');

  const publicClient = usePublicClient();

  return useQuery(
    [address, fn, ...args, TrustedMulticallForwarder.address],
    async () => {
      try {
        return (await readMulticall(
          TrustedMulticallForwarder.address,
          abi,
          address,
          fn,
          args,
          publicClient,
          account.address,
          BigInt(0)
        )) as T;
      } catch (error) {
        console.log({
          error,
        });
        return defaultValue;
      }
    },
    {
      staleTime: 50,
    }
  );
};
