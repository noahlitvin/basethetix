import { useWallets } from '@web3-onboard/react';
import { useMemo } from 'react';

export const useAccount = () => {
  const connectedWallets = useWallets();

  const address = useMemo(
    () => connectedWallets[0]?.accounts[0]?.address,
    [connectedWallets]
  );
  const isConnected = useMemo(() => !!address, [address]);

  return {
    address,
    isConnected,
  };
};
