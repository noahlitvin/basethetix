import { providers } from 'ethers';

export const INFURA_WEB3_API_KEY = '9e5649bac0c04de4a91a75651384a04b';

export const baseProvider = new providers.JsonRpcProvider(
  `https://base-mainnet.infura.io/v3/${INFURA_WEB3_API_KEY}`
);

export const baseGoerliProvider = new providers.JsonRpcProvider(
  `https://base-goerli.infura.io/v3/${INFURA_WEB3_API_KEY}`
);

export const getProvider = (network: string) => {
  if (network === 'base-goerli') {
    return baseGoerliProvider;
  } else if (network === 'base') {
    return baseProvider;
  }

  return new providers.JsonRpcProvider(undefined, network);
};
