import { useAccount, useContractRead } from 'wagmi';
import { parseUnits } from '../utils/format';
import { useMemo } from 'react';
import { sUSDC_address } from '../constants/markets';
import { formatUnits } from 'viem';
import { useContract } from './useContract';

export const useGetCollateral = (account: string | undefined) => {
  const { address, isConnected } = useAccount();
  const synthetix = useContract('SYNTHETIX');

  const { data, isLoading, refetch } = useContractRead({
    address: synthetix.address as `0x${string}`,
    abi: synthetix?.abi,
    functionName: 'getAccountCollateral',
    args: [account, sUSDC_address],
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
