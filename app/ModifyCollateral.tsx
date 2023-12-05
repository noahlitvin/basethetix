import { FC, useState } from 'react';
import { Box, Button, Heading, Text } from '@chakra-ui/react';

import Modify from './Modify';
import { formatDuration, intervalToDuration } from 'date-fns';
import { useGetWithdrawable } from '../hooks/useGetWithdrawable';
import { useModifyCollateral } from '../hooks/useModifyCollateral';
import { useGetMarketInfo } from '../hooks/useGetMarketInfo';

interface ModifyCollateralProps {
  account: string;
}

export const ModifyCollateral: FC<ModifyCollateralProps> = ({ account }) => {
  const { withdrawable } = useGetWithdrawable(account);

  const accountTimeout = 0; //todo
  const [amount, setAmount] = useState(0);

  const submit = useModifyCollateral(account, amount);

  return (
    <>
      <Modify
        account={account}
        onSubmit={submit}
        amount={amount}
        setAmount={setAmount}
      />
    </>
  );
};
