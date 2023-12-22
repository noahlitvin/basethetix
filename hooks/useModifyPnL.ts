import { useGetPreferredPool } from './useGetPreferredPool';
import { useCallback, useMemo, useState } from 'react';
import { useContract } from './useContract';
import { USD_MarketId, sUSDC_address } from '../constants/markets';
import { TransactionRequest, parseEther, parseUnits, zeroAddress } from 'viem';
import { useApprove } from './useApprove';
import { Address, useAccount, useWalletClient } from 'wagmi';
import { PopulatedTransaction } from 'ethers';
import { useMulticall } from './useMulticall';
import { waitForTransaction } from 'wagmi/actions';
import { useDefaultNetwork } from './useDefaultNetwork';
import { GAS_PRICE } from '../constants/gasPrices';

export const useModifyPnL = (
  account: string | undefined,
  amount: number | string
) => {
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
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  const SPOT_MARKET = useContract('SPOT_MARKET');
  const SYNTHETIX = useContract('SYNTHETIX');
  const USDC = useContract('USDC');
  const sUSD = useContract('snxUSD');
  const poolId = useGetPreferredPool();

  const { makeMulticall } = useMulticall();

  const [isLoading, setIsLoading] = useState(false);

  const { network } = useDefaultNetwork();

  const amountWithSlippage = useMemo(
    () => (BigInt(amount) * 11n) / 10n,
    [amount]
  );

  const usdcAmount = useMemo(
    () =>
      parseUnits(
        String(amountWithSlippage || 0),
        network === 'base-goerli' ? 0 : 12
      ).toString(),
    [amountWithSlippage, network]
  );

  const { approve: approveUSDC, requireApproval: USDCrequireApproval } =
    useApprove(USDC.address, usdcAmount, SPOT_MARKET.address);

  const { contract: sUSDC_Contract } = useApprove(
    sUSDC_address[network],
    amount,
    SYNTHETIX.address
  );

  const { contract: sUSD_Contract } = useApprove(
    sUSD.address,
    amount,
    SYNTHETIX.address
  );

  const submit = useCallback(
    async (isAdding: boolean) => {
      try {
        setIsLoading(true);

        if (!walletClient) {
          return;
        }

        if (isAdding) {
          //5% slippage
          if (USDCrequireApproval) {
            await approveUSDC();
            console.log('approve USDC done!');
          }

          // USDC => sUSDC
          const txs: PopulatedTransaction[] = [
            await SPOT_MARKET.contract.populateTransaction.wrap(
              USD_MarketId,
              usdcAmount,
              amountWithSlippage
            ),
          ];

          // approve sUSDC => SPOT_MARKET
          console.log('sUDSC approval for SPOT');
          txs.push(
            await sUSDC_Contract.populateTransaction.approve(
              SPOT_MARKET.address,
              amountWithSlippage
            )
          );

          // sell sUSDC => sUSD
          txs.push(
            await SPOT_MARKET.contract.populateTransaction.sell(
              USD_MarketId,
              amountWithSlippage,
              amount,
              zeroAddress
            )
          );

          // approve sUSD to SYNTHETIX
          txs.push(
            await sUSD_Contract.populateTransaction.approve(
              SYNTHETIX.address,
              amountWithSlippage
            )
          );

          // deposit sUSD
          txs.push(
            await SYNTHETIX.contract.populateTransaction.deposit(
              account,
              sUSD_Contract.address,
              amountWithSlippage
            )
          );

          txs.push(
            await SYNTHETIX.contract.populateTransaction.burnUsd(
              account,
              poolId,
              sUSDC_address[network],
              amountWithSlippage
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

          const hash = await walletClient.sendTransaction({
            ...txn,
            gas: GAS_PRICE,
          });

          await waitForTransaction({
            hash,
          });
        } else {
          const hash = await walletClient.writeContract({
            abi: SYNTHETIX.abi,
            address: SYNTHETIX.address,
            functionName: 'mintUsd',
            args: [account, poolId, sUSDC_Contract.address, amount],
          });
          await waitForTransaction({
            hash,
          });
        }
      } catch (error) {
        console.log(error);
      }

      setIsLoading(false);
    },
    [
      walletClient,
      SYNTHETIX.contract.populateTransaction,
      SYNTHETIX.address,
      SYNTHETIX.abi,
      account,
      poolId,
      network,
      amountWithSlippage,
      USDCrequireApproval,
      SPOT_MARKET.contract.populateTransaction,
      SPOT_MARKET.address,
      usdcAmount,
      sUSDC_Contract.populateTransaction,
      sUSDC_Contract.address,
      amount,
      sUSD_Contract.populateTransaction,
      sUSD_Contract.address,
      makeMulticall,
      address,
      approveUSDC,
    ]
  );

  return {
    submit,
    isLoading,
  };
};
