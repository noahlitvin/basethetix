import { useNetwork } from 'wagmi';
import { baseGoerli } from 'wagmi/chains';
import { networkList } from '../constants/contracts';

export const isChainSupported = (chain: string | undefined) =>
  networkList.findIndex((network) => network === chain) > -1;

export const useDefaultNetwork = () => {
  const { chain } = useNetwork();

  const network = isChainSupported(chain?.network) ? chain : null;

  return network || baseGoerli;
};

export const useChainId = () => {
  const network = useDefaultNetwork();
  if (!network) throw new Error('Network not found');
  return network.id;
};
