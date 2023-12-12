import { useQuery } from 'wagmi';
import { useGetPreferredPool } from './useGetPreferredPool';
import { sUSDC_address } from '../constants/markets';
import { useContract } from './useContract';

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

  return useQuery(
    ['getPositionDebt', accountId, poolId, sUSDC_address],
    async () => {
      try {
        const debt = await synthetix.contract.callStatic.getPositionDebt(
          accountId,
          poolId,
          sUSDC_address
        );

        return -Number(debt.toString());
      } catch (error) {
        console.log(error);
        return 0;
      }
    },
    {
      enabled: !!poolId,
      initialData: 0,
    }
  );
};
