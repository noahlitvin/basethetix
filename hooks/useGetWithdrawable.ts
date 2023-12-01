import { useAccount, useContractRead } from "wagmi";
import synthetix from "../deployments/system/CoreProxy.json";
import usdc from "../deployments/usdc_mock_collateral/MintableToken.json";
import { parseUnits } from "../utils/format";

export const useGetWithdrawable = (account: string | undefined) => {
  const { address, isConnected } = useAccount();

  // TODO: This should actually be a call for sUSDC and sUSD and then add two values.

  const { data, isLoading, refetch } = useContractRead({
    address: synthetix.address as `0x${string}`,
    abi: synthetix?.abi,
    functionName: "getAccountAvailableCollateral",
    args: [account, usdc.address],
    enabled: isConnected && !!address,
    watch: true,
  });

  let withdrawableCollateral = parseUnits(data?.toString() || "0");

  return {
    withdrawable: withdrawableCollateral,
    isLoading,
    refetch,
  };
};
