import { useMemo } from 'react';
import { useWallets } from '@web3-onboard/react';
import { ethers } from 'ethers';
import { useQuery } from '@tanstack/react-query';

export const useSigner = () => {
  const connectedWallets = useWallets();
  const ethersProvider = useMemo(() => {
    if (!connectedWallets.length) {
      return null;
    }
    return new ethers.providers.Web3Provider(
      connectedWallets[0]?.provider,
      'any'
    );
  }, [connectedWallets]);

  return useQuery(
    [connectedWallets[0]?.accounts[0]?.address || ''],
    () => {
      return ethersProvider?.getUncheckedSigner();
    },
    {
      enabled: !!connectedWallets[0]?.provider,
      staleTime: 100000,
    }
  );
};
