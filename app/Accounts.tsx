import { Box, Button, useToast, Text } from '@chakra-ui/react';
import type { NextComponentType } from 'next';
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import synthetix from '../deployments/system/CoreProxy.json';
import { useEffect } from 'react';
import { filter } from 'lodash';
import CreateAccount from './CreateAccount';
import { useGetAccounts } from '../hooks/useGetAccounts';
import { prettyString } from '../utils/format';

const Accounts: NextComponentType = () => {
  const toast = useToast();

  const createAccountAbi = {
    address: synthetix.address as `0x${string}`,
    functionName: 'createAccount',
    abi: filter(synthetix.abi, {
      name: 'createAccount',
      outputs: [
        {
          internalType: 'uint128',
          name: 'accountId',
          type: 'uint128',
        },
      ],
    }),
  };

  const { accounts, refetch } = useGetAccounts();

  const { config } = usePrepareContractWrite(createAccountAbi);

  const { data, write } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: 'Success',
        description: `Successfully created account ${data?.hash}`,
        status: 'success',
        duration: 9000,
        isClosable: true,
      });
    }
  }, [isSuccess, data?.hash, toast]);

  return (
    <Box mb={10}>
      <Text fontSize='sm' mb={1}>
        LP Accounts
      </Text>
      {accounts.map((account) => (
        <Button
          key={account.id}
          mr={3}
          mb={3}
          colorScheme='blue'
          size='xs'
          fontFamily='monospace'
          lineHeight='1'
          _hover={{ background: 'blue.500' }}
        >
          #{prettyString(account.accountId || '')}
        </Button>
      ))}

      <CreateAccount />
    </Box>
  );
};

export default Accounts;
