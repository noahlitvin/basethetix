import { AddIcon, MinusIcon } from '@chakra-ui/icons';
import {
  Button,
  Flex,
  FormControl,
  FormHelperText,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { FC, useMemo, useState } from 'react';
import { Address, useAccount, useBalance } from 'wagmi';
import USD from '../deployments/usdc_mock_collateral/MintableToken.json';
import { Amount } from '../components/Amount';
import { wei } from '@synthetixio/wei';

interface ModifyProps {
  amount: number;
  setAmount: (amount: number) => void;
  onSubmit: (isAdding: boolean) => void;
  balance: string | undefined;
}

export const Modify: FC<ModifyProps> = ({
  amount,
  setAmount,
  onSubmit,
  balance,
}) => {
  const { address } = useAccount();

  const [isAdding, setIsAdding] = useState(true);

  const newAmount = useMemo(() => {
    return Number(balance) + (isAdding ? amount : -amount);
  }, [balance, amount, isAdding]);

  const { data: USDCBalance, refetch: refetchUSD } = useBalance({
    address,
    token: USD.address as Address,
    watch: true,
  });

  return (
    <>
      <Flex mb={4} flex={1}>
        <FormControl>
          <Input
            px={0}
            readOnly
            type='text'
            value={balance?.toLocaleString() + ' USDC'}
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
              value={amount}
              onChange={(e: any) => setAmount(Math.abs(e.target.value || 0))}
              min={0}
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
            value={newAmount + ' USDC'}
            border='none'
            px={0}
          />
        </FormControl>
      </Flex>
      <Button
        isDisabled={amount == 0}
        colorScheme='blue'
        borderRadius='full'
        w='100%'
        my='4'
        onClick={() => onSubmit(isAdding)}
      >
        {isAdding ? 'Add' : 'Remove'} {Math.abs(amount)} USDC
      </Button>
    </>
  );
};

export default Modify;
