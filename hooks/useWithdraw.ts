export const useWithdraw = (account: string | undefined) => {
  /*
    Because of token approvals, it occurs to me we might want a smart contract that composes the calls with the spot market and the core system?
    need to think on it....
    See useGetWithdrawable

    withdrawablesUSD = getAccountAvailableCollateral with sUSDC
    if(withdrawablesUSD > 0) {
      buy sUSDC with the sUSD  SPOT MARKET https://github.com/Synthetixio/synthetix-v3/blob/main/markets/spot-market/contracts/modules/AtomicOrderModule.sol#L79
    }

    withdrawablesUSDC = getAccountAvailableCollateral
    withdraw(account, sUsdcAddress, withdrawablesUSDC) CORE SYSTEM https://github.com/Synthetixio/synthetix-v3/blob/main/protocol/synthetix/contracts/modules/core/CollateralModule.sol#L37
    unwrap(uint128 marketId,withdrawablesUSDC+withdrawablesUSD,withdrawablesUSDC+withdrawablesUSD) SPOT MARKET https://github.com/Synthetixio/synthetix-v3/blob/main/markets/spot-market/contracts/modules/WrapperModule.sol#L48
  */
};
