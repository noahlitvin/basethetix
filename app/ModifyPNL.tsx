import { FC, useState } from 'react';
import { Box, Button, Heading, Text } from '@chakra-ui/react';

import Modify from './Modify';
import { useGetPnl } from '../hooks/useGetPnl';
import { formatUnits } from 'ethers/lib/utils.js';
import { useModifyPnL } from '../hooks/useModifyPnL';

interface ModifyPNLProps {
  account: string;
}

export const ModifyPNL: FC<ModifyPNLProps> = ({ account }) => {
  const [amount, setAmount] = useState(0);
  const { data: pnl } = useGetPnl(account);
  const submit = useModifyPnL(account, amount);

  return (
    <Modify
      onSubmit={submit}
      amount={amount}
      setAmount={setAmount}
      balance={formatUnits(pnl)}
    />
  );
};
