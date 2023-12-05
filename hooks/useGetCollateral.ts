import { useAccount, useContractRead } from 'wagmi';
import synthetix from '../deployments/system/CoreProxy.json';
import usdc from '../deployments/usdc_mock_collateral/MintableToken.json';
import { parseUnits } from '../utils/format';
import { useMemo } from 'react';

export const useGetCollateral = (account: string | undefined) => {
  const { address, isConnected } = useAccount();

  const { data, isLoading, refetch } = useContractRead({
    address: synthetix.address as `0x${string}`,
    abi: synthetix?.abi,
    functionName: 'getAccountCollateral',
    args: [account, usdc.address],
    enabled: isConnected && !!address,
    watch: true,
  });

  console.log({
    data,
  });

  const [totalDeposited, totalAssigned, totalLocked] = useMemo(() => {
    return ((data as bigint[]) || [0n, 0n, 0n]).map((n) =>
      parseUnits(n.toString() || '0')
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
