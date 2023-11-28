import { useAccount, useContractRead } from "wagmi";
import synthetix from "../deployments/system/CoreProxy.json";
import usdc from "../deployments/usdc_mock_collateral/MintableToken.json";
import { parseUnits } from "../utils/format";

export const useGetCollateral = (account: string | undefined) => {
  const { address, isConnected } = useAccount();

  const { data, isLoading, refetch } = useContractRead({
    address: synthetix.address as `0x${string}`,
    abi: synthetix?.abi,
    functionName: "getAccountCollateral",
    args: [account, usdc.address],
    enabled: isConnected && !!address,
    watch: true,
  });

  let delegatedCollateral;
  if (Array.isArray(data) && data.length > 1) {
    delegatedCollateral = parseUnits(data[1]);
  }

  return {
    collateral: delegatedCollateral,
    isLoading,
    refetch,
  };
};
