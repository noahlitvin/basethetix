import { useContractRead } from 'wagmi';
import { useContract } from './useContract';

export const useGetMarketInfo = (marketId: string | number) => {
  const spotMarketProxy = useContract('SPOT_MARKET');

  const { data: name } = useContractRead({
    address: spotMarketProxy.address,
    abi: spotMarketProxy.abi,
    functionName: 'name',
    args: [marketId],
  });

  const { data: synthAddress } = useContractRead({
    address: spotMarketProxy.address,
    abi: spotMarketProxy.abi,
    functionName: 'getSynth',
    args: [marketId],
  });

  return {
    name,
    synthAddress,
  };
};
