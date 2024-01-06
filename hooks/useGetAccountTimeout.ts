import { useContractRead } from 'wagmi';
import { useMemo } from 'react';
import { ethers } from 'ethers';
import { useTimer } from 'react-timer-hook';
import { useContract } from './useContract';

export const useAccountTimeout = (accountId: string | undefined) => {
  /*
    const currentTimestamp = could get this from the RPC ideally, or just make something based on Date.now()

    const accountLastInteraction = https://github.com/Synthetixio/synthetix-v3/blob/main/protocol/synthetix/contracts/modules/core/AccountModule.sol#L196

    const accountTimeoutWithdraw = getConfigUint https://github.com/Synthetixio/synthetix-v3/blob/main/protocol/synthetix/contracts/modules/core/UtilsModule.sol#L120C14-L120C27
    k = "accountTimeoutWithdraw"

    const timeSinceInteraction = currentTimestamp - accountLastInteraction

    const timeUntilWithdrawal = accountTimeoutWithdraw - timeSinceInteraction

    return Math.max(0,timeUntilWithdrawal)

    // For context, this is the relevant code. It's a countdown to when we could avoid this revert
    // https://github.com/Synthetixio/synthetix-v3/blob/main/protocol/synthetix/contracts/storage/Account.sol#L193
  */
  const synthetix = useContract('SYNTHETIX');

  const { data: accountLastInteraction } = useContractRead({
    address: synthetix.address as `0x${string}`,
    abi: synthetix?.abi,
    functionName: 'getAccountLastInteraction',
    args: [accountId],
    watch: true,
  });
  const { data: accountTimeoutWithdraw, refetch } = useContractRead({
    address: synthetix.address as `0x${string}`,
    abi: synthetix?.abi,
    functionName: 'getConfigUint',
    args: [ethers.utils.formatBytes32String('accountTimeoutWithdraw')],
    watch: true,
  });

  const expiryTimestamp = useMemo(
    () =>
      new Date(
        (Number(accountLastInteraction?.toString()) +
          Number(accountTimeoutWithdraw?.toString())) *
          1000
      ),
    [accountLastInteraction, accountTimeoutWithdraw]
  );

  const {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds: accountTimeout,
  } = useTimer({
    expiryTimestamp,
  });

  const timerLabel = useMemo(() => {
    const timeArray = [days, hours, minutes, seconds];

    if (!days) {
      timeArray.shift();
    }

    if (!hours) {
      timeArray.shift();
    }

    if (!minutes) {
      timeArray.shift();
    }

    return timeArray.map((time) => String(time).padStart(2, '0')).join(':');
  }, [days, hours, minutes, seconds]);

  return {
    accountTimeout,
    timerLabel,
  };
};
