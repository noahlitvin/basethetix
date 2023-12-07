import { FC, useState } from 'react';
import { Box, Button, Heading, Text } from '@chakra-ui/react';

import Modify from './Modify';
import { formatDuration, intervalToDuration } from 'date-fns';
import { useGetWithdrawable } from '../hooks/useGetWithdrawable';
import { useModifyCollateral } from '../hooks/useModifyCollateral';
import { useGetMarketInfo } from '../hooks/useGetMarketInfo';
import { Address, useAccount, useBalance } from 'wagmi';
import USD from '../deployments/usdc_mock_collateral/MintableToken.json';
import { useGetCollateral } from '../hooks/useGetCollateral';

interface ModifyCollateralProps {
  account: string;
}

export const ModifyCollateral: FC<ModifyCollateralProps> = ({ account }) => {
  const { withdrawable } = useGetWithdrawable(account);

  const { address } = useAccount();

  const accountTimeout = 0; //todo
  const [amount, setAmount] = useState(0);

  const submit = useModifyCollateral(account, amount);

  const { totalAssigned: collateral } = useGetCollateral(account);

  return (
    <Modify
      onSubmit={submit}
      amount={amount}
      setAmount={setAmount}
      balance={collateral}
    />
  );
};
