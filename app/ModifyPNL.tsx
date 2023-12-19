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
  const pnl = useGetPnl(account);
  const { submit, isLoading } = useModifyPnL(account, amount);

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
        subtractOnly={pnl > 0}
        balance={formatUnits(pnl.toString())}
        amount={amount}
        isLoading={isLoading}
        setAmount={setAmount}
        onSubmit={submit}
      />
    </Box>
  );
};
