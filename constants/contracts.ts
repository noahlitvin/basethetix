import BaseSepoliaPerpsMarketProxy from '../deployments/base-sepolia/perpsFactory/PerpsMarketProxy.json';
import BaseSepoliaCoreProxy from '../deployments/base-sepolia/system/CoreProxy.json';
import BaseSepoliaSpotMarketProxy from '../deployments/base-sepolia/spotFactory/SpotMarketProxy.json';
import BaseSepoliaPerpsAccountProxy from '../deployments/base-sepolia/perpsFactory/PerpsAccountProxy.json';
import BaseSepoliaCoreAccountProxy from '../deployments/base-sepolia/system/AccountProxy.json';
import BaseSepoliaUSDProxy from '../deployments/base-sepolia/system/USDProxy.json';
import BaseSepoliaUSDC from '../deployments/base-sepolia/usdc_mock_collateral/MintableToken.json';
import BaseSepoliaTrustedMulticallForwarder from '../deployments/base-sepolia/system/trusted_multicall_forwarder/TrustedMulticallForwarder.json';

import BaseGoerliPerpsMarketProxy from '../deployments/base-goerli/perpsFactory/PerpsMarketProxy.json';
import BaseGoerliCoreProxy from '../deployments/base-goerli/system/CoreProxy.json';
import BaseGoerliSpotMarketProxy from '../deployments/base-goerli/spotFactory/SpotMarketProxy.json';
import BaseGoerliPerpsAccountProxy from '../deployments/base-goerli/perpsFactory/PerpsAccountProxy.json';
import BaseGoerliCoreAccountProxy from '../deployments/base-goerli/system/AccountProxy.json';
import BaseGoerliUSDProxy from '../deployments/base-goerli/system/USDProxy.json';
import BaseGoerliUSDC from '../deployments/base-goerli/usdc_mock_collateral/MintableToken.json';
import BaseGoerliTrustedMulticallForwarder from '../deployments/base-goerli/system/trusted_multicall_forwarder/TrustedMulticallForwarder.json';

import BasePerpsMarketProxy from '../deployments/base/perpsFactory/PerpsMarketProxy.json';
import BaseCoreProxy from '../deployments/base/system/CoreProxy.json';
import BaseSpotMarketProxy from '../deployments/base/spotFactory/SpotMarketProxy.json';
import BasePerpsAccountProxy from '../deployments/base/perpsFactory/PerpsAccountProxy.json';
import BaseCoreAccountProxy from '../deployments/base/system/AccountProxy.json';
import BaseUSDProxy from '../deployments/base/system/USDProxy.json';
import BaseTrustedMulticallForwarder from '../deployments/base/system/trusted_multicall_forwarder/TrustedMulticallForwarder.json';

import ERC20 from '../constants/ERC20.json';

import IPythVerifier from '../constants/IPythVerifier.json';

interface Contracts {
  [key: string]: {
    chainId: number;
    SYNTHETIX: any;
    PERPS_MARKET: any;
    SPOT_MARKET: any;
    PERPS_ACCOUNT_PROXY: any;
    ACCOUNT_PROXY: any;
    snxUSD: any;
    USDC: any;
    OracleVerifier: any;
    TrustedMulticallForwarder: any;
  };
}

export const contracts: Contracts = {
  'base-sepolia': {
    chainId: 84532,
    SYNTHETIX: BaseSepoliaCoreProxy,
    PERPS_MARKET: BaseSepoliaPerpsMarketProxy,
    SPOT_MARKET: BaseSepoliaSpotMarketProxy,
    PERPS_ACCOUNT_PROXY: BaseSepoliaPerpsAccountProxy,
    ACCOUNT_PROXY: BaseSepoliaCoreAccountProxy,
    snxUSD: BaseSepoliaUSDProxy,
    USDC: BaseSepoliaUSDC,
    TrustedMulticallForwarder: BaseSepoliaTrustedMulticallForwarder,
    OracleVerifier: {
      address: '0xA2aa501b19aff244D90cc15a4Cf739D2725B5729',
      abi: IPythVerifier,
    },
  },
  'base-goerli': {
    chainId: 84531,
    SYNTHETIX: BaseGoerliCoreProxy,
    PERPS_MARKET: BaseGoerliPerpsMarketProxy,
    SPOT_MARKET: BaseGoerliSpotMarketProxy,
    PERPS_ACCOUNT_PROXY: BaseGoerliPerpsAccountProxy,
    ACCOUNT_PROXY: BaseGoerliCoreAccountProxy,
    snxUSD: BaseGoerliUSDProxy,
    USDC: BaseGoerliUSDC,
    TrustedMulticallForwarder: BaseGoerliTrustedMulticallForwarder,
    OracleVerifier: {
      address: '0x5955C1478F0dAD753C7E2B4dD1b4bC530C64749f',
      abi: IPythVerifier,
    },
  },
  base: {
    chainId: 8453,
    SYNTHETIX: BaseCoreProxy,
    PERPS_MARKET: BasePerpsMarketProxy,
    SPOT_MARKET: BaseSpotMarketProxy,
    PERPS_ACCOUNT_PROXY: BasePerpsAccountProxy,
    ACCOUNT_PROXY: BaseCoreAccountProxy,
    snxUSD: BaseUSDProxy,
    USDC: {
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      abi: ERC20,
    },
    TrustedMulticallForwarder: BaseTrustedMulticallForwarder,
    OracleVerifier: {
      address: '0x4c5d8A75F3762c1561D96f177694f67378705E98',
      abi: IPythVerifier,
    },
  },
} as const;

export const networkList = Object.entries(contracts).map(([key]) => key);
