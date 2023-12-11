import { FC, useState } from 'react';
import { Box, Button, Heading, Text } from '@chakra-ui/react';

import Modify from './Modify';
import { useGetPnl } from '../hooks/useGetPnl';
import { formatUnits } from 'ethers/lib/utils.js';
import { useModifyPnL } from '../hooks/useModifyPnL';
import WithdrawAll from './WithdrawAll';

interface ModifyPNLProps {
  account: string;
}

export const ModifyPNL: FC<ModifyPNLProps> = ({ account }) => {
  const [amount, setAmount] = useState(0);
  const { data: pnl } = useGetPnl(account);
  const submit = useModifyPnL(account, pnl);

  return pnl < 0 ? (
    <Box mb={2}>
      <WithdrawAll account={account} />
    </Box>
  ) : (
    <Box mb={2}>
      <Text fontSize='sm' mb='2'>
        As a temporary security measure, you must wait 24 hours to finalize a
        withdrawal.
      </Text>
      <Modify
        subtractOnly
        amount={amount}
        setAmount={setAmount}
        onSubmit={submit}
      />
    </Box>
  );
};
