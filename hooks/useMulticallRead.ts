import { BigNumberish, Contract, ethers } from 'ethers';
import { useAccount, useQuery } from 'wagmi';
import { readMulticall } from '../utils/readMulticall';
import { useContract } from './useContract';
import { useDefaultNetwork } from './useDefaultNetwork';

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
  const account = useAccount();

  const TrustedMulticallForwarder = useContract('TrustedMulticallForwarder');

  const { network } = useDefaultNetwork();

  const provider = new ethers.providers.JsonRpcProvider(
    network === 'base-goerli'
      ? 'https://goerli.base.org'
      : 'https://mainnet.base.org'
  );

  return useQuery(
    [contract.address, fn, ...args, TrustedMulticallForwarder.address],
    async () => {
      try {
        return (await readMulticall(
          TrustedMulticallForwarder.address,
          contract,
          fn,
          args,
          provider,
          account.address,
          BigInt(0)
        )) as T;
      } catch (error) {
        console.log({
          error,
        });
      }
    },
    {
      enabled: !!contract && !!fn && !!provider,
      staleTime: 50,
    }
  );
};
