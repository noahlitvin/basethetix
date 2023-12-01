import { FC } from "react";
import { Box, Button, Heading, Text } from "@chakra-ui/react";

import Modify from "./Modify";
import { formatDuration, intervalToDuration } from "date-fns";
import { useGetWithdrawable } from "../hooks/useGetWithdrawable";

interface ModifyPNLProps {
  account: string;
}

export const ModifyPNL: FC<ModifyPNLProps> = ({ account }) => {
  return (
    <Modify
      account={account}
      onSubmit={(amount) => {
        console.log("amount:", amount);
      }}
    />
  );
};
