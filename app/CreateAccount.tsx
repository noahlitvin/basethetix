import { Button, useToast } from "@chakra-ui/react";
import type { NextComponentType } from "next";
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import synthetix from "../deployments/system/CoreProxy.json";
import { useEffect } from "react";
import { filter } from "lodash";

const CreateAccount: NextComponentType = () => {
  const toast = useToast();

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

  console.log(createAccountAbi);

  const { config } = usePrepareContractWrite(createAccountAbi);

  const { data, write } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

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

  console.log(write);

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
      isLoading={isLoading}
      disabled={!write || isLoading}
      onClick={() => write && write()}
    >
      {isLoading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
    </Button>
  );
};

export default CreateAccount;
