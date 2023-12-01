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
      {withdrawable.gt(0) && (
        <Box
          mb={4}
          mt={2}
          pt={4}
          borderTop="1px solid"
          borderTopColor="gray.200"
        >
          <Heading size="sm" mb={1}>
            Withdraw USDC
          </Heading>
          <Text mb={3} fontSize="sm">
            As a temporary security precaution, you must wait 24 hours after
            interacting with your account to withdraw USDC.{" "}
            {accountTimeout.gt(0) && (
              <em>
                You have{" "}
                {formatDuration(
                  intervalToDuration({ start: 0, end: accountTimeout })
                )}{" "}
                remaining.
              </em>
            )}
          </Text>
          {accountTimeout.gt(0) ? (
            <Button isDisabled colorScheme="blue" borderRadius="full" w="100%">
              {withdrawable?.toLocaleString()} USDC Pending Withdrawal
            </Button>
          ) : (
            <Button colorScheme="blue" borderRadius="full" w="100%">
              Withdraw {withdrawable?.toLocaleString()} USDC
            </Button>
          )}
        </Box>
      )}
    </>
  );
};
