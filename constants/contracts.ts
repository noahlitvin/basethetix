import BaseGoerliPerpsMarketProxy from '../deployments/perpsFactory/PerpsMarketProxy.json';
import BaseGoerliCoreProxy from '../deployments/system/CoreProxy.json';
import BaseGoerliSpotMarketProxy from '../deployments/spotFactory/SpotMarketProxy.json';
import BaseGoerliPerpsAccountProxy from '../deployments/perpsFactory/PerpsAccountProxy.json';
import BaseGoerliUSDProxy from '../deployments/system/USDProxy.json';
import BaseGoerliUSDC from '../deployments/usdc_mock_collateral/MintableToken.json';
import IPythVerifier from '../constants/IPythVerifier.json';

interface Contracts {
  [key: string]: {
    chainId: number;
    SYNTHETIX: any;
    PERPS_MARKET: any;
    SPOT_MARKET: any;
    PERPS_ACCOUNT_PROXY: any;
    USD: any;
    USDC: any;
    OracleVerifier: any;
  };
}

export const contracts: Contracts = {
  'base-goerli': {
    chainId: 84531,
    SYNTHETIX: BaseGoerliCoreProxy,
    PERPS_MARKET: BaseGoerliPerpsMarketProxy,
    SPOT_MARKET: BaseGoerliSpotMarketProxy,
    PERPS_ACCOUNT_PROXY: BaseGoerliPerpsAccountProxy,
    USD: BaseGoerliUSDProxy,
    USDC: BaseGoerliUSDC,
    OracleVerifier: {
      address: '0x5955C1478F0dAD753C7E2B4dD1b4bC530C64749f',
      abi: IPythVerifier,
    },
  },
} as const;
