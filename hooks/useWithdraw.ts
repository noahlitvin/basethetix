import { useCallback } from 'react';
import { useGetWithdrawable } from './useGetWithdrawable';
import { PopulatedTransaction } from 'ethers';
import { useContract } from './useContract';
import { Address, useAccount, useWalletClient } from 'wagmi';
import { USD_MarketId, sUSDC_address } from '../constants/markets';
import { parseUnits } from 'ethers/lib/utils.js';
import { TransactionRequest } from 'viem';
import { useMulticall } from './useMulticall';
import { waitForTransaction } from 'wagmi/actions';
import { useDefaultNetwork } from './useDefaultNetwork';
import { GAS_PRICE } from '../constants/gasPrices';

export const useWithdraw = (account: string | undefined) => {
  /*
    Because of token approvals, it occurs to me we might want a smart contract that composes the calls with the spot market and the core system?
    need to think on it....
    See useGetWithdrawable

    withdrawablesUSD = getAccountAvailableCollateral with sUSDC
    if(withdrawablesUSD > 0) {
      buy sUSDC with the sUSD  SPOT MARKET https://github.com/Synthetixio/synthetix-v3/blob/main/markets/spot-market/contracts/modules/AtomicOrderModule.sol#L79
    }

    withdrawablesUSDC = getAccountAvailableCollateral
    withdraw(account, sUsdcAddress, withdrawablesUSDC) CORE SYSTEM https://github.com/Synthetixio/synthetix-v3/blob/main/protocol/synthetix/contracts/modules/core/CollateralModule.sol#L37
    unwrap(uint128 marketId,withdrawablesUSDC+withdrawablesUSD,withdrawablesUSDC+withdrawablesUSD) SPOT MARKET https://github.com/Synthetixio/synthetix-v3/blob/main/markets/spot-market/contracts/modules/WrapperModule.sol#L48
  */

  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  const SPOT_MARKET = useContract('SPOT_MARKET');
  const SYNTHETIX = useContract('SYNTHETIX');

  const { withdrawable } = useGetWithdrawable(account);
  const { makeMulticall } = useMulticall();

  const { network } = useDefaultNetwork();

  return useCallback(async () => {
    if (!walletClient) {
      return;
    }
    try {
      const txs: PopulatedTransaction[] = [
        await SYNTHETIX.contract.populateTransaction.withdraw(
          account,
          sUSDC_address[network],
          parseUnits(withdrawable),
          {
            gasLimit: GAS_PRICE,
          }
        ),
        await SPOT_MARKET.contract.populateTransaction.unwrap(
          USD_MarketId,
          parseUnits(withdrawable),
          0
        ),
      ];

      const txn = await makeMulticall(
        txs as TransactionRequest[],
        address as Address
      );

      const hash = await walletClient?.sendTransaction({
        to: txn.to as Address,
        data: txn.data as Address,
        value: txn.value || 0n,
        gas: GAS_PRICE,
      });

      waitForTransaction({
        hash,
      });
    } catch (error) {}
  }, [
    SPOT_MARKET.contract.populateTransaction,
    SYNTHETIX.contract.populateTransaction,
    account,
    address,
    makeMulticall,
    network,
    walletClient,
    withdrawable,
  ]);
};
