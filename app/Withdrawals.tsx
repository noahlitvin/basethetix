import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { FC } from 'react';
import { useGetWithdrawable } from '../hooks/useGetWithdrawable';
import { useWithdraw } from '../hooks/useWithdraw';
import { useAccountTimeout } from '../hooks/useGetAccountTimeout';

interface WithdrawalsProps {
  account?: string;
}

export const Withdrawals: FC<WithdrawalsProps> = ({ account }) => {
  const { withdrawable } = useGetWithdrawable(account);

  const { accountTimeout, timerLabel } = useAccountTimeout(account);

  const withdraw = useWithdraw(account);
  return (
    Number(withdrawable) > 0 && (
      <Box borderLeft='1px solid #ffffff' pl={6} py={3} mt={6}>
        <Heading size='sm' mb={1}>
          Withdraw USDC
        </Heading>
        <Text mb={3} fontSize='sm'>
          As a security precaution, you must wait 24 hours after interacting
          with your account to withdraw USDC.{' '}
          {accountTimeout > 0 && (
            <em>
              You have <b>{timerLabel}</b> remaining.
            </em>
          )}
        </Text>
        {accountTimeout > 0 ? (
          <Button isDisabled colorScheme='blue' borderRadius='full' w='100%'>
            {withdrawable?.toLocaleString()} USDC Pending Withdrawal
          </Button>
        ) : (
          <Button
            onClick={withdraw}
            colorScheme='blue'
            borderRadius='full'
            w='100%'
          >
            Withdraw {withdrawable?.toLocaleString()} USDC
          </Button>
        )}
      </Box>
    )
  );
};

export default Withdrawals;
