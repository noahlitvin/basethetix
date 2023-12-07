import { Address, useAccount, useContractRead } from 'wagmi';
import synthetix from '../deployments/system/CoreProxy.json';
import { sUSDC_address } from '../constants/markets';
import { formatUnits } from 'ethers/lib/utils.js';

export const useGetWithdrawable = (account: string | undefined) => {
  const { address, isConnected } = useAccount();

  const { data, isLoading, refetch } = useContractRead({
    address: synthetix.address as Address,
    abi: synthetix?.abi,
    functionName: 'getAccountAvailableCollateral',
    args: [account, sUSDC_address],
    enabled: isConnected && !!address,
    watch: true,
  });

  let withdrawableCollateral = formatUnits(data?.toString() || '0');

  return {
    withdrawable: withdrawableCollateral?.toString(),
    isLoading,
    refetch,
  };
};
