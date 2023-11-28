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
import { useState } from 'react';
import { useGetWithdrawable } from '../hooks/useGetWithdrawable';
import { useGetCollateral } from '../hooks/useGetCollateral';

const Modify: NextComponentType<
  {},
  {},
  { isCollateral: boolean; account: string }
> = ({ isCollateral, account }) => {
  const { collateral } = useGetCollateral(account);

  const [isAdding, setIsAdding] = useState(true);
  const [isWithdrawalPending, setIsWithdrawalPending] = useState(true); // this is if there's collateral in the collateral that isn't delegated
  const [isWithdrawable, setIsWithdrawble] = useState(false); // this is if the above is true and the account timeout has passed

  const [amount, setAmount] = useState(0);

  const { withdrawable } = useGetWithdrawable(account);

  /*
  Modify Collateral
    If increasing:
      Wrap input amount of USDC into sUSDC with the spot market
      Deposit sUSDC
      Delegate to the pool
    If decreasing:
      Undelegate
  Withdraw Collateral:
    Withdraw and unwrap to USDC
  Modify PnL
    If increasing:
      Wrap input amount of USDC into sUSDC with the spot market
      Sell sUSDC to sUSD with the spot market
      Burn sUSD
    If decreasing:
      opposite of above
  
    Remember to add erc7412 library, old version should probably be fine here since we aren't settling orders with this app.
  */

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
            Wallet Balance: 0.00 USDC
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
              onChange={(e: any) => setAmount(e.target.value)}
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
          <FormHelperText>0.00 USDC</FormHelperText>
        </FormControl>
      </Flex>
      <Button
        isDisabled={amount == 0}
        colorScheme='blue'
        borderRadius='full'
        w='100%'
        mb='4'
      >
        {isAdding ? 'Add' : 'Remove'} {Math.abs(amount)} USDC
      </Button>

      {isCollateral && isWithdrawalPending && (
        <Box
          mb={4}
          mt={2}
          pt={4}
          borderTop='1px solid'
          borderTopColor='gray.200'
        >
          <Heading size='sm' mb={1}>
            Withdraw USDC
          </Heading>
          <Text mb={3} fontSize='sm'>
            As a temporary security precaution, you must wait 24 hours after
            interacting with your account to withdraw USDC.{' '}
            {!isWithdrawable && <em>You have X hours remaining.</em>}
          </Text>
          {isWithdrawable ? (
            <Button colorScheme='blue' borderRadius='full' w='100%'>
              Withdraw {withdrawable?.toLocaleString()} USDC
            </Button>
          ) : (
            <Button isDisabled colorScheme='blue' borderRadius='full' w='100%'>
              {withdrawable?.toLocaleString()} USDC Pending Withdrawal
            </Button>
          )}
        </Box>
      )}
    </>
  );
};

export default Modify;
