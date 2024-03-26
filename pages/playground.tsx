/* eslint-disable @next/next/no-page-custom-font */
import { Flex, Button } from '@chakra-ui/react';
import type { NextPage } from 'next';
import { useCallback } from 'react';
import { useDefaultNetwork } from '../hooks/useDefaultNetwork';
import { useGetCollateralConfiguration } from '../hooks/useGetCollateralConfiguration';
import { USD_MarketId, sUSDC_address } from '../constants/markets';
import { useContract } from '../hooks/useContract';
import { Address, useAccount, useBalance } from 'wagmi';
import { Amount } from '../components/Amount';
import { wei } from '@synthetixio/wei';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useTransact } from '../hooks/useTransact';
import { PopulatedTransaction } from 'ethers';
import { TransactionRequest } from 'viem';

const Playground: NextPage = () => {
  const { network } = useDefaultNetwork();
  const { data: collateralConfiguration } = useGetCollateralConfiguration(
    sUSDC_address[network]
  );
  const { address } = useAccount();

  const SPOT_MARKET = useContract('SPOT_MARKET');
  const SYNTHETIX = useContract('SYNTHETIX');
  const { data: sUSDCBalance } = useBalance({
    address,
    token: sUSDC_address[network] as Address,
    watch: true,
  });

  const { transact } = useTransact();

  const unwrap = useCallback(async () => {
    try {
      const txs: PopulatedTransaction[] = [
        await SPOT_MARKET.contract.populateTransaction.unwrap(
          USD_MarketId,
          sUSDCBalance?.value,
          0
        ),
      ];

      await transact(txs as TransactionRequest[], SYNTHETIX.abi);
    } catch (error) {
      console.log('error:', error);
    }
  }, [
    SPOT_MARKET.contract.populateTransaction,
    SYNTHETIX.abi,
    sUSDCBalance?.value,
    transact,
  ]);
  return (
    <Flex p={10} gap={10} flexDirection='column' mb={3} alignItems='center'>
      <ConnectButton />
      <Button isDisabled={sUSDCBalance?.value === 0n} onClick={unwrap}>
        unwrap&nbsp;
        <Amount value={wei(sUSDCBalance?.formatted || '0')} suffix='sUSDC' />
      </Button>
    </Flex>
  );
};

export default Playground;
