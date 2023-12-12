import { useContractRead } from 'wagmi';
import synthetix from '../deployments/system/CoreProxy.json';

export const useGetPreferredPool = () => {
  const { data: poolId } = useContractRead({
    address: synthetix.address as `0x${string}`,
    abi: synthetix?.abi,
    functionName: 'getPreferredPool',
    args: [],
    watch: true,
  });

  return poolId?.toString();
};
