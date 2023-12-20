import { Box, Button, Text } from '@chakra-ui/react';
import CreateAccount from './CreateAccount';
import { useGetAccounts } from '../hooks/useGetAccounts';
import { prettyString } from '../utils/format';
import { useEffect } from 'react';

interface AccountsProps {
  selectedAccount: string | undefined;
  setSelectedAccount: (accountId: string | undefined) => void;
}

const Accounts: React.FC<AccountsProps> = ({
  selectedAccount,
  setSelectedAccount,
}) => {
  const { accounts } = useGetAccounts();

  useEffect(() => {
    if (!accounts.find((account) => selectedAccount === account.accountId)) {
      setSelectedAccount(accounts[0]?.accountId);
    }
  }, [accounts, selectedAccount, setSelectedAccount]);

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
          border='1px solid'
          borderColor='blue.500'
          background={account.id === selectedAccount ? 'blue.500' : 'black'}
          _hover={{ background: 'blue.500' }}
          onClick={() => setSelectedAccount(account.id)}
        >
          #{prettyString(account.accountId || '')}
        </Button>
      ))}

      <CreateAccount />
    </Box>
  );
};

export default Accounts;
