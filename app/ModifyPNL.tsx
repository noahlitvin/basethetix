import { FC, useState } from 'react';
import { Box, Button, Heading, Text } from '@chakra-ui/react';

import Modify from './Modify';
import { formatDuration, intervalToDuration } from 'date-fns';
import { useGetWithdrawable } from '../hooks/useGetWithdrawable';

interface ModifyPNLProps {
  account: string;
}

export const ModifyPNL: FC<ModifyPNLProps> = ({ account }) => {
  const [amount, setAmount] = useState(0);
  return (
    <Modify
      account={account}
      onSubmit={(isAdding) => {
        console.log('isAdding:', isAdding);
      }}
      amount={amount}
      setAmount={setAmount}
    />
  );
};
