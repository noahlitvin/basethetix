import { useGetCollateral } from './useGetCollateral';
import { useGetPreferredPool } from './useGetPreferredPool';
import { useCallback, useMemo, useState } from 'react';
import { useContract } from './useContract';
import { USD_MarketId, sUSDC_address } from '../constants/markets';
import { TransactionRequest, parseEther, parseUnits } from 'viem';
import { useApprove } from './useApprove';
import { PopulatedTransaction } from 'ethers';
import { useDefaultNetwork } from './useDefaultNetwork';
import { useToast } from '@chakra-ui/react';
import { useTransact } from './useTransact';

export const useModifyCollateral = (
  account: string | undefined,
  amount: number,
  isAdding: boolean,
  onSuccess: () => void
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

  const toast = useToast();

  const SPOT_MARKET = useContract('SPOT_MARKET');
  const SYNTHETIX = useContract('SYNTHETIX');
  const USDC = useContract('USDC');
  const poolId = useGetPreferredPool();

  const [isLoading, setIsLoading] = useState(false);

  const amountD18 = useMemo(
    () => parseEther(String(amount || 0)).toString(),
    [amount]
  );
  const { network } = useDefaultNetwork();

  const usdcAmount = useMemo(
    () =>
      parseUnits(
        String(amount || 0),
        network === 'base-goerli' ? 18 : 6
      ).toString(),
    [amount, network]
  );

  const newCollateralAmountD18 = useMemo(
    () =>
      parseEther(
        String((isAdding ? 1 : -1) * amount + Number(currentCollateral || '0'))
      ).toString(),
    [amount, currentCollateral, isAdding]
  );

  const { approve: approveUSDC, requireApproval: USDCrequireApproval } =
    useApprove(USDC.address, usdcAmount, SPOT_MARKET.address);

  const { requireApproval: requireApproval_sUSDC, contract: sUSDC_Contract } =
    useApprove(sUSDC_address[network], amountD18, SYNTHETIX.address);

  const { transact } = useTransact();

  const submit = useCallback(async () => {
    try {
      setIsLoading(true);
      if (isAdding) {
        if (USDCrequireApproval) {
          await approveUSDC();
          // console.log('approve USDC done!');
        }

        const txs: PopulatedTransaction[] = [
          await SPOT_MARKET.contract.populateTransaction.wrap(
            USD_MarketId,
            usdcAmount,
            amountD18
          ),
        ];

        if (requireApproval_sUSDC) {
          // console.log('adding approval!');

          txs.push(
            await sUSDC_Contract.populateTransaction.approve(
              SYNTHETIX.address,
              amountD18
            )
          );
        }

        txs.push(
          await SYNTHETIX.contract.populateTransaction.deposit(
            account,
            sUSDC_address[network],
            amountD18
          ),
          await SYNTHETIX.contract.populateTransaction.delegateCollateral(
            account,
            poolId,
            sUSDC_address[network],
            newCollateralAmountD18,
            parseEther('1')
          )
        );

        await transact(txs as TransactionRequest[], SYNTHETIX.abi);
      } else {
        const txs: PopulatedTransaction[] = [
          await SYNTHETIX.contract.populateTransaction.delegateCollateral(
            account,
            poolId,
            sUSDC_address[network],
            newCollateralAmountD18,
            parseEther('1')
          ),
        ];

        await transact(txs as TransactionRequest[], SYNTHETIX.abi);
      }

      onSuccess();

      toast({
        title: 'Success',
        description: `Successfully done`,
        status: 'success',
        duration: 10000,
        isClosable: true,
      });
    } catch (error) {}
    setIsLoading(false);
  }, [
    SPOT_MARKET.contract.populateTransaction,
    SYNTHETIX.abi,
    SYNTHETIX.address,
    SYNTHETIX.contract.populateTransaction,
    USDCrequireApproval,
    account,
    amountD18,
    approveUSDC,
    isAdding,
    network,
    newCollateralAmountD18,
    onSuccess,
    poolId,
    requireApproval_sUSDC,
    sUSDC_Contract.populateTransaction,
    toast,
    transact,
    usdcAmount,
  ]);
  return {
    submit,
    isLoading,
    newCollateralAmountD18,
  };
};
