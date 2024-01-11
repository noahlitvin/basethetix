import { FC, useMemo, useState } from 'react';
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';

import { useModifyCollateral } from '../hooks/useModifyCollateral';
import { useGetCollateral } from '../hooks/useGetCollateral';
import { useGetPnl } from '../hooks/useGetPnl';
import WithdrawAll from './WithdrawAll';
import { useGetCollateralConfiguration } from '../hooks/useGetCollateralConfiguration';
import { sUSDC_address } from '../constants/markets';
import { useDefaultNetwork } from '../hooks/useDefaultNetwork';
import { Address, formatUnits, parseEther } from 'viem';
import { Amount } from '../components/Amount';
import { useContract } from '../hooks/useContract';
import { useAccount, useBalance } from 'wagmi';
import { AddIcon, MinusIcon } from '@chakra-ui/icons';
import { wei } from '@synthetixio/wei';

interface ModifyCollateralProps {
  account: string;
  onSuccess: () => void;
}

export const ModifyCollateral: FC<ModifyCollateralProps> = ({
  account,
  onSuccess,
}) => {
  const [amount, setAmount] = useState(0);
  const { address } = useAccount();
  const [isAdding, setIsAdding] = useState(false);

  const USDC = useContract('USDC');

  const { submit, isLoading, newCollateralAmountD18 } = useModifyCollateral(
    account,
    amount,
    isAdding,
    onSuccess
  );

  const { data: pnl, refetch } = useGetPnl(account);

  const { totalAssigned: collateral } = useGetCollateral(account);
  const { network } = useDefaultNetwork();
  const { data: collateralConfiguration } = useGetCollateralConfiguration(
    sUSDC_address[network]
  );

  const minDelegationD18 = useMemo(() => {
    return formatUnits(
      (collateralConfiguration as any)?.minDelegationD18?.toString() || '0',
      18
    );
  }, [collateralConfiguration]);

  const minDelegationValidation = useMemo(() => {
    return (
      BigInt(newCollateralAmountD18 || '0') >=
      BigInt(
        (collateralConfiguration as any)?.minDelegationD18?.toString() || '0'
      )
    );
  }, [collateralConfiguration, newCollateralAmountD18]);

  const newAmount = useMemo(() => {
    return Number(collateral) + (isAdding ? amount : -amount);
  }, [collateral, amount, isAdding]);

  const { data: USDCBalance } = useBalance({
    address,
    token: USDC.address as Address,
    watch: true,
  });

  if (pnl > 0n || Math.abs(Number(pnl.toString())) < parseEther('0.001')) {
    return (
      <Box mb={2}>
        <>
          <Flex mb={4} flex={1} alignItems='center'>
            <FormControl>
              <Amount value={wei(collateral || '0')} suffix='USDC' />
              <FormHelperText top={7} whiteSpace='nowrap' position='absolute'>
                <Flex
                  alignItems='center'
                  fontWeight='normal'
                  fontSize='sm'
                  gap={1}
                >
                  Wallet Balance:
                  <Amount
                    value={wei(USDCBalance?.formatted || '0')}
                    suffix='USDC'
                  />
                </Flex>
              </FormHelperText>
            </FormControl>

            <FormControl>
              <InputGroup>
                <InputLeftElement>
                  <IconButton
                    size='xs'
                    colorScheme='blue'
                    aria-label='Add/Subtract'
                    icon={isAdding ? <AddIcon /> : <MinusIcon />}
                    onClick={() => setIsAdding(!isAdding)}
                  />
                </InputLeftElement>
                <Input
                  type='number'
                  value={amount}
                  onChange={(e: any) =>
                    setAmount(Math.abs(e.target.value || 0))
                  }
                  min={0}
                />
              </InputGroup>
            </FormControl>

            <FormControl maxWidth='40px'>
              <Input readOnly type='text' value='=' border='none' py={0} />
            </FormControl>
            <FormControl>
              <Amount value={wei(newAmount || '0')} suffix='USDC' />
            </FormControl>
          </Flex>
          <Button
            isDisabled={
              amount == 0 || !minDelegationValidation || newAmount < 0
            }
            colorScheme='blue'
            borderRadius='full'
            w='100%'
            my='4'
            onClick={() => submit()}
            isLoading={isLoading}
          >
            {isAdding ? 'Add' : 'Remove'} {Math.abs(amount)} USDC
          </Button>
        </>

        {!minDelegationValidation && (
          <Alert status='error'>
            <AlertIcon />
            Min new delegation amount is {minDelegationD18} USDC
          </Alert>
        )}
      </Box>
    );
  }

  return (
    <Box mb={2}>
      <WithdrawAll account={account} onSuccess={refetch} />
    </Box>
  );
};
