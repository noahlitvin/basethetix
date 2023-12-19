import { useContractRead, useQuery } from 'wagmi';
import { useGetPreferredPool } from './useGetPreferredPool';
import { sUSDC_address } from '../constants/markets';
import { useContract } from './useContract';
import { useDefaultNetwork } from './useDefaultNetwork';
import { useMemo } from 'react';

export const useGetPnl = (accountId: string | undefined) => {
  /*
  poolId = getPreferredPool() https://github.com/Synthetixio/synthetix-v3/blob/main/protocol/synthetix/contracts/interfaces/IPoolConfigurationModule.sol#L50;
  https://github.com/Synthetixio/synthetix-v3/blob/main/protocol/synthetix/contracts/interfaces/IVaultModule.sol#L91C14-L91C29
  function getPositionDebt(
        uint128 accountId, // this is the 'selected account id' getting passed in
        uint128 poolId, // getPreferredPool() https://github.com/Synthetixio/synthetix-v3/blob/main/protocol/synthetix/contracts/interfaces/IPoolConfigurationModule.sol#L50;
        address collateralType // USDC address
    ) external returns (int256 debtD18);

  return this value, after multiplying by -1
*/
  const synthetix = useContract('SYNTHETIX');
  const poolId = useGetPreferredPool();
  const { network } = useDefaultNetwork();

  const { data, isError, isLoading } = useContractRead({
    address: synthetix.address,
    abi: synthetix.abi,
    functionName: 'getPositionDebt',
    args: [accountId, poolId, sUSDC_address[network]],
  });

  return useMemo(() => {
    if (!data) {
      return 0;
    }

    return -Number(data.toString() || '0');
  }, [data]);
};
