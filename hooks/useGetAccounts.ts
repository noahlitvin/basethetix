import { useAccount, useContractRead, useContractReads } from 'wagmi';
import accountProxy from '../deployments/system/AccountProxy.json';

export const useGetAccounts = () => {
  const { address, isConnected } = useAccount();

  const {
    data: acccountCount,
    isLoading: acccountCountisLoading,
    refetch,
  } = useContractRead({
    address: accountProxy.address as `0x${string}`,
    abi: accountProxy?.abi,
    functionName: 'balanceOf',
    args: [address || '0x'],
    enabled: isConnected && !!address,
    watch: true,
  });

  const { data: accountIds, isLoading: accountIdsIsLoading } = useContractReads(
    {
      enabled: Boolean(!acccountCountisLoading && !!acccountCount),
      //@ts-ignore
      contracts:
        Number(acccountCount) > 0
          ? Array.from(Array(Number(acccountCount?.toString())).keys())?.map(
              (index) => {
                return {
                  address: accountProxy?.address as `0x${string}`,
                  abi: accountProxy?.abi,
                  functionName: 'tokenOfOwnerByIndex',
                  args: [address, index],
                };
              }
            )
          : [],
    }
  );

  return {
    acccountCount: acccountCount as bigint,
    accounts: (accountIds || []).map((item) => ({
      owner: address?.toString()!,
      accountId: item?.toString(),
      id: item?.toString(),
    })),
    isLoading: accountIdsIsLoading || acccountCountisLoading,
    refetch,
  };
};
