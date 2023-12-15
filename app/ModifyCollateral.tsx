import { FC, useState } from 'react';
import { Box } from '@chakra-ui/react';

import Modify from './Modify';
import { useGetWithdrawable } from '../hooks/useGetWithdrawable';
import { useModifyCollateral } from '../hooks/useModifyCollateral';
import { useGetCollateral } from '../hooks/useGetCollateral';
import { useGetPnl } from '../hooks/useGetPnl';
import WithdrawAll from './WithdrawAll';
import { useAccount } from '../hooks/useAccount';

interface ModifyCollateralProps {
  account: string;
}

export const ModifyCollateral: FC<ModifyCollateralProps> = ({ account }) => {
  const { withdrawable } = useGetWithdrawable(account);

  const { address } = useAccount();

  const accountTimeout = 0; //todo
  const [amount, setAmount] = useState(0);

  const { submit, isLoading } = useModifyCollateral(account, amount);

  const { data: pnl } = useGetPnl(account);

  const { totalAssigned: collateral } = useGetCollateral(account);

  return pnl < 0 ? (
    <Box mb={2}>
      <WithdrawAll account={account} />
    </Box>
  ) : (
    <Box mb={2}>
      <Modify
        onSubmit={submit}
        amount={amount}
        setAmount={setAmount}
        balance={collateral}
        isLoading={isLoading}
      />
    </Box>
  );
};
