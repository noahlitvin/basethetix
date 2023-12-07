import { useGetPreferredPool } from './useGetPreferredPool';
import { useCallback, useMemo } from 'react';
import { useContract } from './useContract';
import { USD_MarketId, sUSDC_address } from '../constants/markets';
import { TransactionRequest, parseEther, zeroAddress } from 'viem';
import { useApprove } from './useApprove';
import { makeMulticall } from '../utils/multicall';
import { Address, useAccount, useSigner } from 'wagmi';
import { PopulatedTransaction } from 'ethers';
import { useGetPnl } from './useGetPnl';

export const useModifyPnL = (account: string | undefined, amount: number) => {
  /*
    Because of token approvals, it occurs to me we might want a smart contract that composes the calls with the spot market and the core system?
    need to think on it....

  currentPnL = useGetPnL(account)
  poolId = getPreferredPool() or can be hardcoded https://github.com/Synthetixio/synthetix-v3/blob/main/protocol/synthetix/contracts/interfaces/IPoolConfigurationModule.sol#L50;

  if(currentPnL < newPnL) {
    //USDC
    wrap(marketId,newPnl - currentPnL,newPnl - currentPnL) SPOT MARKET https://github.com/Synthetixio/synthetix-v3/blob/main/markets/spot-market/contracts/modules/WrapperModule.sol#L48
    //sUSDC
    sell(marketId, newPnl - currentPnL, newPnl - currentPnL, zeroAddress) SPOT MARKET https://github.com/Synthetixio/synthetix-v3/blob/main/markets/spot-market/contracts/modules/AtomicOrderModule.sol#L218
    // sUSD
    deposit(account, sUsdAddress, newPnl - currentPnL) CORE SYSTEM https://github.com/Synthetixio/synthetix-v3/blob/main/protocol/synthetix/contracts/modules/core/CollateralModule.sol#L37
    burnUsd(accountId, poolId, sUsdcAddress, newPnl - currentPnL) CORE SYSTEM https://github.com/Synthetixio/synthetix-v3/blob/main/protocol/synthetix/contracts/modules/core/IssueUSDModule.sol#L123
  } else {
    mintUsd(accountId, poolId, sUsdcAddress, currentPnL - newPnL) CORE SYSTEM https://github.com/Synthetixio/synthetix-v3/blob/main/protocol/synthetix/contracts/modules/core/IssueUSDModule.sol#L52
  }
  */
  const { data: signer } = useSigner();
  const { address } = useAccount();
  const SPOT_MARKET = useContract('SPOT_MARKET');
  const SYNTHETIX = useContract('SYNTHETIX');
  const USDC = useContract('USDC');
  const sUSD = useContract('snxUSD');
  const poolId = useGetPreferredPool();
  const { data: pnl } = useGetPnl(account);

  const amountD18 = useMemo(
    () => parseEther(String(amount || 0)).toString(),
    [amount]
  );

  const { approve: approveUSDC, requireApproval: USDCrequireApproval } =
    useApprove(USDC.address, amountD18, SPOT_MARKET.address);

  const { contract: sUSDC_Contract } = useApprove(
    sUSDC_address,
    amountD18,
    SYNTHETIX.address
  );

  const { contract: sUSD_Contract } = useApprove(
    sUSD.address,
    amountD18,
    SYNTHETIX.address
  );

  return useCallback(
    async (isAdding: boolean) => {
      try {
        if (isAdding) {
          if (USDCrequireApproval) {
            await approveUSDC();
            console.log('approve USDC done!');
          }

          // USDC => sUSDC
          const txs: PopulatedTransaction[] = [
            await SPOT_MARKET.contract.populateTransaction.wrap(
              USD_MarketId,
              amountD18,
              amountD18
            ),
          ];

          // approve sUSDC => SPOT_MARKET
          console.log('sUDSC approval for SPOT');
          txs.push(
            await sUSDC_Contract.populateTransaction.approve(
              SPOT_MARKET.address,
              amountD18
            )
          );

          // sell sUSDC => sUSD
          txs.push(
            await SPOT_MARKET.contract.populateTransaction.sell(
              USD_MarketId,
              amountD18,
              amountD18,
              zeroAddress
            )
          );

          console.log('snxUSD a`pproval for Core');
          txs.push(
            await sUSD_Contract.populateTransaction.approve(
              SYNTHETIX.address,
              amountD18
            )
          );

          // deposit sUSD
          txs.push(
            await SYNTHETIX.contract.populateTransaction.deposit(
              account,
              sUSD_Contract.address,
              amountD18
            )
          );

          txs.push(
            await SYNTHETIX.contract.populateTransaction.burnUsd(
              account,
              poolId,
              sUSDC_Contract.address,
              amountD18
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
          await SYNTHETIX.contract.mintUsd(
            account,
            poolId,
            sUSDC_Contract.address,
            amountD18
          );
        }
      } catch (error) {
        console.log(error);
      }
    },
    [
      USDCrequireApproval,
      SPOT_MARKET.contract.populateTransaction,
      SPOT_MARKET.address,
      amountD18,
      sUSDC_Contract.populateTransaction,
      sUSDC_Contract.address,
      sUSD_Contract.populateTransaction,
      sUSD_Contract.address,
      SYNTHETIX.address,
      SYNTHETIX.contract,
      account,
      poolId,
      address,
      signer,
      approveUSDC,
    ]
  );
};
