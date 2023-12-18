import { Address, useAccount, useContractRead } from 'wagmi';
import { sUSDC_address } from '../constants/markets';
import { formatUnits } from 'ethers/lib/utils.js';
import { useContract } from './useContract';
import { useDefaultNetwork } from './useDefaultNetwork';

export const useGetWithdrawable = (account: string | undefined) => {
  const synthetix = useContract('SYNTHETIX');
  const { address, isConnected } = useAccount();
  const { network } = useDefaultNetwork();

  const { data, isLoading, refetch } = useContractRead({
    address: synthetix.address as Address,
    abi: synthetix?.abi,
    functionName: 'getAccountAvailableCollateral',
    args: [account, sUSDC_address[network]],
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
