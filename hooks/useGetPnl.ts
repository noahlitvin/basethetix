import { useContractRead } from 'wagmi';
import synthetix from '../deployments/system/CoreProxy.json';
import usdc from '../deployments/usdc_mock_collateral/MintableToken.json';

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

  const { data: poolId } = useContractRead({
    address: synthetix.address as `0x${string}`,
    abi: synthetix?.abi,
    functionName: 'getPreferredPool',
    args: [],
    watch: true,
  });
  const { data: debtD18 } = useContractRead({
    address: synthetix.address as `0x${string}`,
    abi: synthetix?.abi,
    functionName: 'getPositionDebt',
    args: [accountId, poolId, usdc.address],
    enabled: !!poolId,
    watch: true,
  });

  return debtD18;
};
