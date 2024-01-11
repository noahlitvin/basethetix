import { ethers } from 'ethers';
import { contracts } from '../constants/contracts';
import { useDefaultNetwork } from './useDefaultNetwork';
import { getProvider } from '../constants/provider';

type ContractName = keyof (typeof contracts)['base-goerli'];

export const useContract = (name: ContractName) => {
  const { network } = useDefaultNetwork();

  const provider = getProvider(network);

  if (name === 'chainId') {
    throw new Error('Cannot use "chainId" as a contract name');
  }
  const contract = contracts[network][name];

  if (!contract) {
    throw new Error(`Contract "${name}" not found on network "${network}"`);
  }

  return {
    address: contract.address as `0x${string}`,
    abi: contract.abi,
    contract: new ethers.Contract(contract.address, contract.abi, provider),
    chainId: contracts[network].chainId,
  };
};
