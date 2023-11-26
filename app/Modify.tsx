import { AddIcon } from "@chakra-ui/icons";
import {
  Button,
  Flex,
  FormControl,
  FormHelperText,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import type { NextComponentType } from "next";
import { useAccount } from "wagmi";

const Modify: NextComponentType = () => {
  const { isConnected } = useAccount();

  return (
    <>
      <Flex mb={4}>
        <FormControl>
          <Input readOnly type="text" value="420.69" border="none" />

          <FormHelperText>Wallet Balance: 0.00 USDC</FormHelperText>
        </FormControl>

        <FormControl>
          <InputGroup>
            <InputLeftElement>
              <IconButton
                size="sm"
                colorScheme="blue"
                aria-label="Search"
                icon={<AddIcon />}
              />
            </InputLeftElement>
            <Input type="number" value={0} />
          </InputGroup>
        </FormControl>
        <FormControl>
          <Input readOnly type="text" value="= 420.69 USDC" border="none" />
          <FormHelperText>0.00 USDC</FormHelperText>
        </FormControl>
      </Flex>
      <Button colorScheme="blue" borderRadius="full" w="100%" mb="4">
        Modify PnL
      </Button>
    </>
  );
};

export default Modify;
