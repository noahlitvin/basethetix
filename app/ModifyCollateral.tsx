import { FC } from "react";
import { Box, Button, Heading, Text } from "@chakra-ui/react";

import Modify from "./Modify";
import { formatDuration, intervalToDuration } from "date-fns";
import { useGetWithdrawable } from "../hooks/useGetWithdrawable";

interface ModifyCollateralProps {
  account: string;
}

export const ModifyCollateral: FC<ModifyCollateralProps> = ({ account }) => {
  const { withdrawable } = useGetWithdrawable(account);

  const accountTimeout = 0; //todo

  return (
    <>
      <Modify
        account={account}
        onSubmit={(amount) => {
          console.log("amount:", amount);
        }}
      />
    </>
  );
};
