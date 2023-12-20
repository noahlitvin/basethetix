import { Address, useContractRead } from 'wagmi';
import { useContract } from './useContract';

export const useGetCollateralConfiguration = (collateralType: string) => {
  const synthetix = useContract('SYNTHETIX');

  return useContractRead({
    address: synthetix.address as Address,
    abi: synthetix?.abi,
    functionName: 'getCollateralConfiguration',
    args: [collateralType],
    watch: true,
  });
};
