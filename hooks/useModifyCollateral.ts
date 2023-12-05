import { useGetCollateral } from './useGetCollateral';
import { useGetPreferredPool } from './useGetPreferredPool';
import { useCallback, useMemo } from 'react';
import { useTransact } from './useTransact';
import { useContract } from './useContract';
import { USD_MarketId, sUSDC_address } from '../constants/markets';
import { parseEther } from 'viem';
import { useApprove } from './useApprove';

export const useModifyCollateral = (
  account: string | undefined,
  amount: number
) => {
  /*
    Because of token approvals, it occurs to me we might want a smart contract that composes the calls with the spot market and the core system?
    need to think on it....

  currentCollateral = useGetCollateral(account)
  poolId = getPreferredPool() https://github.com/Synthetixio/synthetix-v3/blob/main/protocol/synthetix/contracts/interfaces/IPoolConfigurationModule.sol#L50;
  marketId = We can probably hardcode this? otherwise we'd need to see what the preferred pool is backing. Really we should probably just hardcode the pool and spot market and perps market IDs

  if(currentCollateral < newCollateral) {
    //USDC
    wrap(uint128 marketId,newCollateral - currentCollateral,newCollateral - currentCollateral) SPOT MARKET https://github.com/Synthetixio/synthetix-v3/blob/main/markets/spot-market/contracts/modules/WrapperModule.sol#L48
    //sUSDC
    deposit(account, sUsdcAddress, newCollateral - currentCollateral) CORE SYSTEM https://github.com/Synthetixio/synthetix-v3/blob/main/protocol/synthetix/contracts/modules/core/CollateralModule.sol#L37
  }
  //sUSDC
  delegateCollateral(uint128 accountId, uint128 poolId, address sUsdcAddress, uint256 newCollateral, 1) CORE SYSTEM  https://github.com/Synthetixio/synthetix-v3/blob/main/protocol/synthetix/contracts/modules/core/VaultModule.sol#L43
  */
  const { transact } = useTransact();
  const { totalAssigned: currentCollateral } = useGetCollateral(account);

  const SPOT_MARKET = useContract('SPOT_MARKET');
  const SYNTHETIX = useContract('SYNTHETIX');
  const USDC = useContract('USDC');
  const sUSD = useContract('USD');
  const poolId = useGetPreferredPool();

  const amountD18 = useMemo(
    () => parseEther(String(amount || 0)).toString(),
    [amount]
  );

  const { approve: approveUSDC, requireApproval: USDCrequireApproval } =
    useApprove(USDC.address, amountD18, SPOT_MARKET.address);

  const { approve: approve_sUSDC, requireApproval: requireApproval_sUSDC } =
    useApprove(sUSDC_address, amountD18, SYNTHETIX.address);

  // const { data, isLoading, isSuccess, writeAsync } = useContractWrite({
  //   address: synthetix.address as Address,
  //   abi: synthetix.abi,
  //   functionName: 'feed',
  // });

  return useCallback(
    async (isAdding: boolean) => {
      try {
        if (isAdding) {
          const wrapAmount = parseEther(
            String(amount - Number(currentCollateral))
          ).toString();

          if (USDCrequireApproval) {
            await approveUSDC();
          }

          let tx = await SPOT_MARKET.contract.wrap(
            USD_MarketId,
            amountD18,
            amountD18
          );

          await tx.wait();

          if (requireApproval_sUSDC) {
            await approve_sUSDC();
          }

          tx = await SYNTHETIX.contract.deposit(
            account,
            sUSDC_address,
            amountD18
          );

          await tx.wait();

          const newCollateralAmountD18 = parseEther(
            String(amount + Number(currentCollateral))
          ).toString();

          tx = await SYNTHETIX.contract.delegateCollateral(
            account,
            poolId,
            sUSDC_address,
            newCollateralAmountD18,
            parseEther('1')
          );

          await tx.wait();
        }
      } catch (error) {
        console.log(error);
      }
    },
    [
      SPOT_MARKET.contract,
      SYNTHETIX.contract,
      USDCrequireApproval,
      account,
      amount,
      amountD18,
      approveUSDC,
      approve_sUSDC,
      currentCollateral,
      poolId,
      requireApproval_sUSDC,
    ]
  );
};
