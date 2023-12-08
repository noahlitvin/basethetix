import { AddIcon, MinusIcon } from "@chakra-ui/icons";
import { Button, Text } from "@chakra-ui/react";
import { FC, useMemo, useState } from "react";
import { Address, useAccount, useBalance } from "wagmi";
import USD from "../deployments/usdc_mock_collateral/MintableToken.json";
import { Amount } from "../components/Amount";
import { wei } from "@synthetixio/wei";

interface WithdrawAllProps {}

export const WithdrawAll: FC<WithdrawAllProps> = ({}) => {
  return (
    <>
      <Text>
        Your account currently has a negative PnL. This amount must be paid to
        initiate collateral withdrawal.
      </Text>
      <Button colorScheme="blue" borderRadius="full" w="100%" my="4">
        Repay X USDC and withdraw Y USDC
      </Button>
    </>
  );
};

export default WithdrawAll;
