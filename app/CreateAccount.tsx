import { Button, Text, useToast } from "@chakra-ui/react";
import type { NextComponentType } from "next";
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import synthetix from "../deployments/system/CoreProxy.json";
import { useEffect, useState, useRef } from "react";
import { filter } from "lodash";

const CreateAccount: NextComponentType = () => {
  const toast = useToast();
  const [hovered, setHovered] = useState(false);
  const [highlightedCharIndex, setHighlightedCharIndex] = useState(-1);
  const hoverIntervalRef = useRef<NodeJS.Timer | null>(null);

  const createAccountAbi = {
    address: synthetix.address as `0x${string}`,
    functionName: "createAccount",
    abi: filter(synthetix.abi, {
      name: "createAccount",
      outputs: [
        {
          internalType: "uint128",
          name: "accountId",
          type: "uint128",
        },
      ],
    }),
  };

  const { config } = usePrepareContractWrite(createAccountAbi);

  const { data, write } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  const buttonText = isLoading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT";

  useEffect(() => {
    if (hovered && !isLoading) {
      hoverIntervalRef.current = setInterval(() => {
        setHighlightedCharIndex(Math.floor(Math.random() * buttonText.length));
      }, 100);
    }

    return () => {
      if (hoverIntervalRef.current) {
        clearInterval(hoverIntervalRef.current);
      }
    };
  }, [hovered, isLoading, buttonText.length]);

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Success",
        description: `Successfully created account ${data?.hash}`,
        status: "success",
        duration: 9000,
        isClosable: true,
      });
    }
  }, [isSuccess, data?.hash, toast]);

  const renderButtonText = () => {
    return [...buttonText].map((char, index) => (
      <Text
        as="span"
        key={index}
        color={index === highlightedCharIndex ? "blue.500" : "inherit"}
      >
        {char === " " ? "\u00A0" : char}
      </Text>
    ));
  };

  return (
    <Button
      colorScheme="blue"
      mb={3}
      size="xs"
      variant="outline"
      fontFamily="monospace"
      lineHeight="1"
      borderColor="blue.500"
      color="white"
      _hover={{ background: "transparent" }}
      disabled={!write || isLoading}
      onClick={() => write && write()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setHighlightedCharIndex(-1);
      }}
    >
      {renderButtonText()}
    </Button>
  );
};

export default CreateAccount;
