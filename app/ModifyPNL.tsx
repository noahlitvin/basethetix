import { FC } from 'react';
import { Box, Button, Heading, Text } from '@chakra-ui/react';

import Modify from './Modify';
import { formatDuration, intervalToDuration } from 'date-fns';
import { useGetWithdrawable } from '../hooks/useGetWithdrawable';

interface ModifyPNLProps {
  account: string;
}

export const ModifyPNL: FC<ModifyPNLProps> = ({ account }) => {
  /*
  Modify PnL
    If increasing:
      Wrap input amount of USDC into sUSDC with the spot market
      Sell sUSDC to sUSD with the spot market
      Burn sUSD
    If decreasing:
      opposite of above
  
    Remember to add erc7412 library, old version should probably be fine here since we aren't settling orders with this app.
  */

  return (
    <Modify
      account={account}
      onSubmit={(amount) => {
        console.log('amount:', amount);
      }}
    />
  );
};
