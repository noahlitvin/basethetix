import { useGetPreferredPool } from './useGetPreferredPool';
import { useCallback, useMemo, useState } from 'react';
import { useContract } from './useContract';
import { USD_MarketId, sUSDC_address } from '../constants/markets';
import { TransactionRequest, zeroAddress } from 'viem';
import { useApprove } from './useApprove';
import { PopulatedTransaction } from 'ethers';
import { useDefaultNetwork } from './useDefaultNetwork';
import { useToast } from '@chakra-ui/react';
import { useTransact } from './useTransact';
import { formatUnits } from 'ethers/lib/utils';

export const useModifyPnL = (
  account: string | undefined,
  amount: number | string,
  onSuccess: () => void
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
  const SPOT_MARKET = useContract('SPOT_MARKET');
  const SYNTHETIX = useContract('SYNTHETIX');
  const USDC = useContract('USDC');
  const sUSD = useContract('snxUSD');
  const poolId = useGetPreferredPool();
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(false);

  const { network } = useDefaultNetwork();

  const usdcAmount = useMemo(
    () =>
      formatUnits(
        amount.toString() || '0',
        network === 'base-goerli' ? 0 : 12
      ).toString(),
    [amount, network]
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
  const { transact } = useTransact();

  const submit = useCallback(
    async (isAdding: boolean) => {
      try {
        setIsLoading(true);

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
              amount
            ),
          ];

          // approve sUSDC => SPOT_MARKET
          console.log('sUDSC approval for SPOT');
          txs.push(
            await sUSDC_Contract.populateTransaction.approve(
              SPOT_MARKET.address,
              amount
            )
          );

          // sell sUSDC => sUSD
          txs.push(
            await SPOT_MARKET.contract.populateTransaction.sell(
              USD_MarketId,
              amount,
              amount,
              zeroAddress
            )
          );

          // approve sUSD to SYNTHETIX
          txs.push(
            await sUSD_Contract.populateTransaction.approve(
              SYNTHETIX.address,
              amount
            )
          );

          // deposit sUSD
          txs.push(
            await SYNTHETIX.contract.populateTransaction.deposit(
              account,
              sUSD_Contract.address,
              amount
            )
          );

          txs.push(
            await SYNTHETIX.contract.populateTransaction.burnUsd(
              account,
              poolId,
              sUSDC_address[network],
              amount
            )
          );

          await transact(txs as TransactionRequest[], SYNTHETIX.abi);
        } else {
          const txn = await SYNTHETIX.contract.populateTransaction.mintUsd(
            account,
            poolId,
            sUSDC_Contract.address,
            amount
          );

          await transact([txn] as TransactionRequest[], SYNTHETIX.abi);
        }

        onSuccess();

        toast({
          title: 'Success',
          description: `Successfully done`,
          status: 'success',
          duration: 10000,
          isClosable: true,
        });
      } catch (error) {
        // console.log(error);
      }

      setIsLoading(false);
    },
    [
      onSuccess,
      toast,
      USDCrequireApproval,
      SPOT_MARKET.contract.populateTransaction,
      SPOT_MARKET.address,
      usdcAmount,
      amount,
      sUSDC_Contract.populateTransaction,
      sUSDC_Contract.address,
      sUSD_Contract.populateTransaction,
      sUSD_Contract.address,
      SYNTHETIX.address,
      SYNTHETIX.contract.populateTransaction,
      SYNTHETIX.abi,
      account,
      poolId,
      network,
      transact,
      approveUSDC,
    ]
  );

  return {
    submit,
    isLoading,
  };
};
