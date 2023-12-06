import { Address, useAccount, useContractRead } from 'wagmi';
import synthetix from '../deployments/system/CoreProxy.json';
import usdc from '../deployments/usdc_mock_collateral/MintableToken.json';
import { parseUnits } from '../utils/format';
import { sUSDC_address } from '../constants/markets';

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

  let withdrawableCollateral = parseUnits(data?.toString() || '0');

  return {
    withdrawable: withdrawableCollateral,
    isLoading,
    refetch,
  };
};
