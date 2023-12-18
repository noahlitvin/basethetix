import { BigNumberish, Contract } from 'ethers';
import { useCallback, useMemo, useState } from 'react';
import {
  Address,
  erc20ABI,
  useAccount,
  useContractRead,
  useNetwork,
  useWalletClient,
} from 'wagmi';
import { getContract, waitForTransaction } from 'wagmi/actions';

export const useApprove = (
  contractAddress: string,
  amount: BigNumberish,
  spender: string
) => {
  const [isLoading, setIsLoading] = useState(false);
  const { data: walletClient } = useWalletClient();

  const { address: accountAddress } = useAccount();
  const { chain: activeChain } = useNetwork();
  const hasWalletConnected = Boolean(activeChain);

  const { data: allowance, refetch: refetchAllowance } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [accountAddress!, spender as `0x${string}`],
    enabled: hasWalletConnected && !!contractAddress,
  });

  const sufficientAllowance = useMemo(() => {
    return allowance && allowance >= BigInt(amount.toString() || '0');
  }, [allowance, amount]);

  const contract = useMemo(
    () => new Contract(contractAddress, erc20ABI),
    [contractAddress]
  );

  const approve = useCallback(
    async (customAmount?: BigNumberish) => {
      if (!sufficientAllowance && !!contractAddress && !!contract) {
        setIsLoading(true);
        const token = getContract({
          address: contractAddress as Address,
          abi: erc20ABI,
          walletClient: walletClient!,
        });
        const hash = await token.write.approve([
          spender as Address,
          BigInt(String(customAmount || amount)),
        ]);

        await waitForTransaction({
          hash,
        });
        refetchAllowance();
        setIsLoading(false);
      }
    },
    [
      sufficientAllowance,
      contractAddress,
      contract,
      walletClient,
      spender,
      amount,
      refetchAllowance,
    ]
  );

  return {
    isLoading,
    approve,
    refetchAllowance,
    requireApproval: !sufficientAllowance,
    allowance,
    contract,
  };
};
