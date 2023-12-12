import { useCallback } from 'react';
import { useGetWithdrawable } from './useGetWithdrawable';
import { PopulatedTransaction } from 'ethers';
import { useContract } from './useContract';
import { Address, useAccount, useSigner } from 'wagmi';
import { USD_MarketId, sUSDC_address } from '../constants/markets';
import { parseUnits } from 'ethers/lib/utils.js';
import { makeMulticall } from '../utils/multicall';
import { TransactionRequest } from 'viem';

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

  const { data: signer } = useSigner();
  const { address } = useAccount();
  const SPOT_MARKET = useContract('SPOT_MARKET');
  const SYNTHETIX = useContract('SYNTHETIX');

  const { withdrawable } = useGetWithdrawable(account);

  return useCallback(async () => {
    try {
      await SYNTHETIX.contract.withdraw(
        account,
        sUSDC_address,
        parseUnits(withdrawable),
        {
          gasLimit: 1000000,
        }
      );

      const txs: PopulatedTransaction[] = [
        await SYNTHETIX.contract.populateTransaction.withdraw(
          account,
          sUSDC_address,
          parseUnits(withdrawable),
          {
            gasLimit: 1000000,
          }
        ),
        // await SPOT_MARKET.contract.populateTransaction.unwrap(
        //   USD_MarketId,
        //   amountD18,
        //   0
        // ),
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
    } catch (error) {}
  }, [
    SYNTHETIX.contract.populateTransaction,
    account,
    address,
    signer,
    withdrawable,
  ]);
};
