import { FC, useMemo, useState } from 'react';
import { Box, Text } from '@chakra-ui/react';

import Modify from './Modify';
import { useGetPnl } from '../hooks/useGetPnl';
import { formatUnits } from 'ethers/lib/utils.js';
import { useModifyPnL } from '../hooks/useModifyPnL';
import WithdrawAll from './WithdrawAll';
import { parseEther } from 'viem';

interface ModifyPNLProps {
  account: string;
}

export const ModifyPNL: FC<ModifyPNLProps> = ({ account }) => {
  const [amount, setAmount] = useState(0);
  const { data: pnl } = useGetPnl(account);
  const amountD18 = useMemo(
    () => parseEther(String(amount || 0)).toString(),
    [amount]
  );

  const { submit, isLoading } = useModifyPnL(account, amountD18);

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
