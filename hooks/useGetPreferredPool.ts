import { useContractRead } from 'wagmi';
import { useContract } from './useContract';

export const useGetPreferredPool = () => {
  const synthetix = useContract('SYNTHETIX');

  const { data: poolId } = useContractRead({
    address: synthetix.address as `0x${string}`,
    abi: synthetix?.abi,
    functionName: 'getPreferredPool',
    args: [],
    watch: true,
  });

  return poolId?.toString();
};
