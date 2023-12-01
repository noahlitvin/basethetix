import { AddIcon, MinusIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Heading,
  Text,
} from '@chakra-ui/react';
import type { NextComponentType } from 'next';
import { FC, useState } from 'react';
import { useGetWithdrawable } from '../hooks/useGetWithdrawable';
import { useGetCollateral } from '../hooks/useGetCollateral';
import { useAccount, useBalance } from 'wagmi';
import USD from '../deployments/usdc_mock_collateral/MintableToken.json';
import { Amount } from '../components/Amount';
import { wei } from '@synthetixio/wei';
import { formatDuration, intervalToDuration } from 'date-fns';

interface ModifyProps {
  account: string;
  onSubmit: (amount: number) => void;
}

export const Modify: FC<ModifyProps> = ({ account, onSubmit }) => {
  const { address } = useAccount();
  const { collateral } = useGetCollateral(account);

  const [isAdding, setIsAdding] = useState(true);

  const [amount, setAmount] = useState(0);

  // Remember decimals are 18 on mock but 6 on real
  const { data: USDCBalance, refetch: refetchUSD } = useBalance({
    address,
    token: USD.address as `0x${string}`,
    watch: true,
  });

  const resultingWalletBalance = isAdding
    ? (USDCBalance?.value || 0n) - BigInt(amount)
    : (USDCBalance?.value || 0n) + BigInt(amount);

  return (
    <>
      <Flex mb={4} flex={1}>
        <FormControl>
          <Input
            px={0}
            readOnly
            type='text'
            value={collateral?.toLocaleString() + ' USDC'}
            border='none'
          />
          <FormHelperText whiteSpace='nowrap' position='absolute'>
            <Flex alignItems='center' fontWeight='normal' fontSize='sm' gap={1}>
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
              onChange={(e: any) => setAmount(e.target.value || 0)}
            />
          </InputGroup>
        </FormControl>

        <FormControl maxWidth='40px'>
          <Input readOnly type='text' value='=' border='none' py={0} />
        </FormControl>
        <FormControl>
          <Input
            readOnly
            type='text'
            value='420.69 USDC'
            border='none'
            px={0}
          />
          <FormHelperText>
            <Amount value={wei(resultingWalletBalance)} suffix='USDC' />
          </FormHelperText>
        </FormControl>
      </Flex>
      <Button
        isDisabled={amount == 0}
        colorScheme='blue'
        borderRadius='full'
        w='100%'
        mb='4'
        onClick={() => onSubmit(amount)}
      >
        {isAdding ? 'Add' : 'Remove'} {Math.abs(amount)} USDC
      </Button>
    </>
  );
};

export default Modify;
