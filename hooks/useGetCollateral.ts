import { useAccount, useContractRead } from 'wagmi';
import { useMemo } from 'react';
import { sUSDC_address } from '../constants/markets';
import { formatUnits } from 'viem';
import { useContract } from './useContract';
import { useDefaultNetwork } from './useDefaultNetwork';

export const useGetCollateral = (account: string | undefined) => {
  const { address, isConnected } = useAccount();
  const synthetix = useContract('SYNTHETIX');
  const { network } = useDefaultNetwork();

  const { data, isLoading, refetch } = useContractRead({
    address: synthetix.address as `0x${string}`,
    abi: synthetix?.abi,
    functionName: 'getAccountCollateral',
    args: [account, sUSDC_address[network]],
    enabled: isConnected && !!address,
    watch: true,
  });

  const [totalDeposited, totalAssigned, totalLocked] = useMemo(() => {
    return ((data as bigint[]) || [0n, 0n, 0n]).map((n) =>
      formatUnits(n, 18).toString()
    );
  }, [data]);

  return {
    totalDeposited,
    totalAssigned,
    totalLocked,
    isLoading,
    refetch,
  };
};
