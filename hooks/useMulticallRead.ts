import { BigNumberish, Contract } from 'ethers';
import { useProvider, useQuery } from 'wagmi';
import { readMulticall } from '../utils/readMulticall';
import { useAccount } from './useAccount';

export const useMulticallRead = <T = any>(
  contract: Contract,
  fn: string,
  args: Array<any>,
  value?: BigNumberish | undefined
): {
  data: T | undefined;
  isLoading: boolean;
  refetch: () => void;
} => {
  const provider = useProvider();
  const account = useAccount();

  const { data, isLoading, refetch } = useQuery(
    [contract.address, fn, args, value],
    async () => {
      return (await readMulticall(
        contract,
        fn,
        args,
        provider,
        account.address,
        BigInt(value?.toString() || '')
      )) as T;
    },
    {
      enabled: !!contract && !!fn && !!provider,
      staleTime: 50,
    }
  );

  return {
    data,
    isLoading,
    refetch,
  };
};
