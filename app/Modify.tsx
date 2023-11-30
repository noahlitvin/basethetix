import { AddIcon, MinusIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Heading,
  Text,
} from "@chakra-ui/react";
import type { NextComponentType } from "next";
import { useState } from "react";
import { useGetWithdrawable } from "../hooks/useGetWithdrawable";
import { useGetCollateral } from "../hooks/useGetCollateral";
import { useAccount, useBalance } from "wagmi";
import USD from "../deployments/system/USDProxy.json";
import { Amount } from "../components/Amount";
import { wei } from "@synthetixio/wei";
import { formatDuration, intervalToDuration } from "date-fns";

const Modify: NextComponentType<
  {},
  {},
  { isCollateral: boolean; account: string }
> = ({ isCollateral, account }) => {
  const { address } = useAccount();
  const { collateral } = useGetCollateral(account);

  const [isAdding, setIsAdding] = useState(true);

  const [amount, setAmount] = useState(0);

  const { data: USDBalance, refetch: refetchUSD } = useBalance({
    address,
    token: USD.address as `0x${string}`,
    watch: true,
  });

  const { withdrawable } = useGetWithdrawable(account);

  const accountTimeout = 0; //todo

  /*
  Modify Collateral
    If increasing:
      Wrap input amount of USDC into sUSDC with the spot market
      Deposit sUSDC
      Delegate to the pool
    If decreasing:
      Undelegate
  Withdraw Collateral:
    Withdraw and unwrap to USDC
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
    <>
      <Flex mb={4} flex={1}>
        <FormControl>
          <Input
            px={0}
            readOnly
            type="text"
            value={collateral?.toLocaleString() + " USDC"}
            border="none"
          />
          <FormHelperText whiteSpace="nowrap" position="absolute">
            <Flex
              alignItems="center"
              fontWeight="normal"
              fontSize="sm"
              opacity="0.5"
              gap={1}
            >
              Wallet Balance:
              <Amount value={wei(USDBalance?.formatted || "0")} suffix="USDC" />
            </Flex>
          </FormHelperText>
        </FormControl>

        <FormControl>
          <InputGroup>
            <InputLeftElement>
              <IconButton
                size="xs"
                colorScheme="blue"
                aria-label="Add/Subtract"
                icon={isAdding ? <AddIcon /> : <MinusIcon />}
                onClick={() => setIsAdding(!isAdding)}
              />
            </InputLeftElement>
            <Input
              type="number"
              onChange={(e: any) => setAmount(e.target.value)}
            />
          </InputGroup>
        </FormControl>

        <FormControl maxWidth="40px">
          <Input readOnly type="text" value="=" border="none" py={0} />
        </FormControl>
        <FormControl>
          <Input
            readOnly
            type="text"
            value="420.69 USDC"
            border="none"
            px={0}
          />
          <FormHelperText>0.00 USDC</FormHelperText>
        </FormControl>
      </Flex>
      <Button
        isDisabled={amount == 0}
        colorScheme="blue"
        borderRadius="full"
        w="100%"
        mb="4"
      >
        {isAdding ? "Add" : "Remove"} {Math.abs(amount)} USDC
      </Button>

      {isCollateral && withdrawable.gt(0) && (
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

export default Modify;
