import { Button, Text, useToast } from '@chakra-ui/react';
import type { NextComponentType } from 'next';
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import { useEffect, useState, useRef } from 'react';
import { filter } from 'lodash';
import { useContract } from '../hooks/useContract';

interface CreateAccountProps {
  setSelectedAccount: (accountId: string | undefined) => void;
}

const CreateAccount: React.FC<CreateAccountProps> = ({
  setSelectedAccount,
}) => {
  const toast = useToast();
  const [hovered, setHovered] = useState(false);
  const [highlightedCharIndex, setHighlightedCharIndex] = useState(-1);
  const hoverIntervalRef = useRef<NodeJS.Timer | null>(null);

  const synthetix = useContract('SYNTHETIX');

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

  const { config } = usePrepareContractWrite(createAccountAbi);

  const { data, write } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  const buttonText = isLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT';

  useEffect(() => {
    if (hovered && !isLoading) {
      hoverIntervalRef.current = setInterval(() => {
        setHighlightedCharIndex(Math.floor(Math.random() * buttonText.length));
      }, 100);
    }

    return () => {
      if (hoverIntervalRef.current) {
        clearInterval(hoverIntervalRef?.current as unknown as number);
      }
    };
  }, [hovered, isLoading, buttonText.length]);

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: 'Success',
        description: `Account created with transaction ${data?.hash}`,
        status: 'success',
        duration: 10000,
        isClosable: true,
      });
      setSelectedAccount(undefined);
    }
  }, [isSuccess, data?.hash, toast, setSelectedAccount]);

  const renderButtonText = () => {
    return [...buttonText].map((char, index) => (
      <Text
        as='span'
        key={index}
        color={index === highlightedCharIndex ? 'blue.500' : 'inherit'}
      >
        {char === ' ' ? '\u00A0' : char}
      </Text>
    ));
  };

  return (
    <Button
      colorScheme='blue'
      mb={3}
      size='xs'
      variant='outline'
      fontFamily='monospace'
      lineHeight='1'
      borderColor='blue.500'
      color='white'
      _hover={{ background: 'transparent' }}
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
