import { ethers } from 'ethers';
import { useProvider, useSigner } from 'wagmi';
import { contracts } from '../constants/contracts';

type ContractName = keyof (typeof contracts)['base-goerli'];

export const useContract = (name: ContractName) => {
  const network = 'base-goerli';

  if (name === 'chainId') {
    throw new Error('Cannot use "chainId" as a contract name');
  }
  const provider = useProvider();
  const { data: signer } = useSigner();

  const contract = contracts[network][name];

  if (!contract) {
    throw new Error(`Contract "${name}" not found on network "${network}"`);
  }

  return {
    address: contract.address as `0x${string}`,
    abi: contract.abi,
    contract: new ethers.Contract(
      contract.address,
      contract.abi,
      signer || provider
    ),
    chainId: contracts[network].chainId,
  };
};