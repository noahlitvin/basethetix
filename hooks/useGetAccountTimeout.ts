export const useAccountTimeout = (account: string | undefined) => {
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
};
