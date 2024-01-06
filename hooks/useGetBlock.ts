import { useEffect, useState } from 'react';
import { useBlockNumber, usePublicClient } from 'wagmi';

export const useGetBlock = () => {
  const [timestamp, setBlockTimeStamp] = useState(0);
  const { data: blockNumber } = useBlockNumber();
  const provider = usePublicClient();

  useEffect(() => {
    (async () => {
      const block = await provider.getBlock({
        blockTag: 'latest',
      });
      setBlockTimeStamp(Number(block.timestamp.toString()));
    })();
  }, [blockNumber, provider]);

  return {
    blockNumber,
    timestamp,
  };
};
