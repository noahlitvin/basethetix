import { useAccount, useQuery, useWalletClient } from 'wagmi';

export const useSigner = () => {
  const { connector, address } = useAccount();
  const { data } = useWalletClient();

  return {
    data: {
      sendTransaction: (tx: any) => {},
    },
  };
};
