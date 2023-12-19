import { Button, Text } from '@chakra-ui/react';
import { FC } from 'react';
import { Amount } from '../components/Amount';
import { wei } from '@synthetixio/wei';
import { useModifyPnL } from '../hooks/useModifyPnL';
import { useGetPnl } from '../hooks/useGetPnl';
import { formatUnits } from 'ethers/lib/utils.js';

interface WithdrawAllProps {
  account: string;
}

export const WithdrawAll: FC<WithdrawAllProps> = ({ account }) => {
  const pnl = useGetPnl(account);
  const { submit, isLoading } = useModifyPnL(account, Math.abs(pnl));

  return (
    <>
      <Text>
        Your account currently has a negative PnL. This amount must be paid to
        initiate collateral withdrawal.
      </Text>
      <Button
        onClick={() => submit(true)}
        isLoading={isLoading}
        colorScheme='blue'
        borderRadius='full'
        w='100%'
        my='4'
      >
        Repay{' '}
        <Amount value={wei(formatUnits(pnl.toString()) || '0')} suffix='USDC' />{' '}
        USDC and withdraw Y USDC
      </Button>
    </>
  );
};

export default WithdrawAll;
