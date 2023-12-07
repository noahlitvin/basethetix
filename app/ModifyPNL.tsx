import { FC, useState } from 'react';
import { Box, Button, Heading, Text } from '@chakra-ui/react';

import Modify from './Modify';
import { useGetPnl } from '../hooks/useGetPnl';
import { formatUnits } from 'ethers/lib/utils.js';

interface ModifyPNLProps {
  account: string;
}

export const ModifyPNL: FC<ModifyPNLProps> = ({ account }) => {
  const [amount, setAmount] = useState(0);
  const { data: pnl } = useGetPnl(account);

  return (
    <Modify
      onSubmit={(isAdding) => {
        console.log('isAdding:', isAdding);
      }}
      amount={amount}
      setAmount={setAmount}
      balance={formatUnits(pnl)}
    />
  );
};
