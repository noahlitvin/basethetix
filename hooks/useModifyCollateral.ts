import { useGetCollateral } from './useGetCollateral';
import { useGetPreferredPool } from './useGetPreferredPool';
import { useCallback, useMemo } from 'react';
import { useTransact } from './useTransact';
import { useContract } from './useContract';
import { USD_MarketId, sUSDC_address } from '../constants/markets';
import { TransactionRequest, parseEther } from 'viem';
import { useApprove } from './useApprove';
import { makeMulticall } from '../utils/multicall';
import { Address, useAccount, useSigner } from 'wagmi';
import { PopulatedTransaction } from 'ethers';

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
  const { totalAssigned: currentCollateral } = useGetCollateral(account);

  const { data: signer } = useSigner();
  const { address } = useAccount();
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

  const { requireApproval: requireApproval_sUSDC, contract: sUSDC_Contract } =
    useApprove(sUSDC_address, amountD18, SYNTHETIX.address);

  return useCallback(
    async (isAdding: boolean) => {
      try {
        if (isAdding) {
          if (USDCrequireApproval) {
            await approveUSDC();
            console.log('approve USDC done!');
          }

          const txs: PopulatedTransaction[] = [
            await SPOT_MARKET.contract.populateTransaction.wrap(
              USD_MarketId,
              amountD18,
              amountD18
            ),
          ];

          if (requireApproval_sUSDC) {
            console.log('adding approval!');

            txs.push(
              await sUSDC_Contract.populateTransaction.approve(
                SYNTHETIX.address,
                amountD18
              )
            );
          }

          const newCollateralAmountD18 = parseEther(
            String(amount + Number(currentCollateral))
          ).toString();

          txs.push(
            await SYNTHETIX.contract.populateTransaction.deposit(
              account,
              sUSDC_address,
              amountD18,
              {
                gasLimit: 1000000,
              }
            ),
            await SYNTHETIX.contract.populateTransaction.delegateCollateral(
              account,
              poolId,
              sUSDC_address,
              newCollateralAmountD18,
              parseEther('1'),
              {
                gasLimit: 1000000,
              }
            )
          );

          console.log({ txs });
          const txn = await makeMulticall(
            txs as TransactionRequest[],
            address as Address
          );

          console.log({
            txn,
          });

          const tx = await signer?.sendTransaction({
            to: txn.to as Address,
            data: txn.data,
            value: txn.value,
            gasLimit: 1000000,
          });

          await tx?.wait();
        } else {
          const newCollateralAmountD18 = parseEther(
            String(Number(currentCollateral) - amount)
          ).toString();

          const txs: PopulatedTransaction[] = [
            await SYNTHETIX.contract.populateTransaction.delegateCollateral(
              account,
              poolId,
              sUSDC_address,
              newCollateralAmountD18,
              parseEther('1'),
              {
                gasLimit: 1000000,
              }
            ),
            await SPOT_MARKET.contract.populateTransaction.unwrap(
              USD_MarketId,
              amountD18,
              0
            ),
          ];

          console.log({ txs });
          const txn = await makeMulticall(
            txs as TransactionRequest[],
            address as Address
          );

          console.log({
            txn,
          });

          const tx = await signer?.sendTransaction({
            to: txn.to as Address,
            data: txn.data,
            value: txn.value,
            gasLimit: 1000000,
          });

          await tx?.wait();
        }
      } catch (error) {
        console.log(error);
      }
    },
    [
      SPOT_MARKET.contract.populateTransaction,
      SYNTHETIX.address,
      SYNTHETIX.contract,
      USDCrequireApproval,
      account,
      address,
      amount,
      amountD18,
      approveUSDC,
      currentCollateral,
      poolId,
      requireApproval_sUSDC,
      sUSDC_Contract.populateTransaction,
      signer,
    ]
  );
};
