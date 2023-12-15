import { FC, useMemo } from 'react';
import { useConnectWallet, useSetChain } from '@web3-onboard/react';
import { Button } from '@chakra-ui/react';

export const ConnectWallet: FC = () => {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const [
    {
      chains, // the list of chains that web3-onboard was initialized with
      connectedChain, // the current chain the user's wallet is connected to
    },
    setChain, // function to call to initiate user to switch chains in their wallet
  ] = useSetChain();

  const chain = useMemo(
    () => chains.find((chain) => chain.id === connectedChain?.id),
    [chains, connectedChain?.id]
  );

  return (
    <div>
      <p>{wallet?.accounts[0]?.address || ''}</p>
      Chain: {chain?.label || 'Wrong chain'} <br />
      <Button
        disabled={connecting}
        onClick={() => (wallet ? disconnect(wallet) : connect())}
      >
        {connecting ? 'connecting' : wallet ? 'disconnect' : 'connect'}
      </Button>
    </div>
  );
};
