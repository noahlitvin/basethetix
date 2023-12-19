import { FC, useMemo, useState } from 'react';
import { Alert, AlertIcon, Box, Flex, Text } from '@chakra-ui/react';

import Modify from './Modify';
import { useModifyCollateral } from '../hooks/useModifyCollateral';
import { useGetCollateral } from '../hooks/useGetCollateral';
import { useGetPnl } from '../hooks/useGetPnl';
import WithdrawAll from './WithdrawAll';
import { useGetCollateralConfiguration } from '../hooks/useGetCollateralConfiguration';
import { sUSDC_address } from '../constants/markets';
import { useDefaultNetwork } from '../hooks/useDefaultNetwork';
import { formatUnits } from 'viem';

interface ModifyCollateralProps {
  account: string;
}

export const ModifyCollateral: FC<ModifyCollateralProps> = ({ account }) => {
  const [amount, setAmount] = useState(0);

  const { submit, isLoading, newCollateralAmountD18 } = useModifyCollateral(
    account,
    amount
  );

  const pnl = useGetPnl(account);

  const { totalAssigned: collateral } = useGetCollateral(account);
  const { network } = useDefaultNetwork();
  const { data: collateralConfiguration } = useGetCollateralConfiguration(
    sUSDC_address[network]
  );

  const minDelegationD18 = useMemo(() => {
    return formatUnits(
      (collateralConfiguration as any)?.minDelegationD18?.toString() || '0',
      18
    );
  }, [collateralConfiguration]);

  const minDelegationValidation = useMemo(() => {
    return (
      BigInt(newCollateralAmountD18) >=
      BigInt(
        (collateralConfiguration as any)?.minDelegationD18?.toString() || '0'
      )
    );
  }, [collateralConfiguration, newCollateralAmountD18]);

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
        isDisabled={!minDelegationValidation}
      />

      {!minDelegationValidation && (
        <Alert status='error'>
          <AlertIcon />
          Min new delegation amount is {minDelegationD18} USDC
        </Alert>
      )}
    </Box>
  );
};
