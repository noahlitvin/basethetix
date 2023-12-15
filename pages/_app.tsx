import '@rainbow-me/rainbowkit/styles.css';
import {
  RainbowKitProvider,
  darkTheme,
  getDefaultWallets,
} from '@rainbow-me/rainbowkit';

import type { AppProps } from 'next/app';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { goerli, baseGoerli } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import theme from '../theme';
import { Analytics } from '@vercel/analytics/react';
import { useEffect, useState } from 'react';

import { infuraProvider } from 'wagmi/providers/infura';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { init } from '@web3-onboard/react';
import injectedModule from '@web3-onboard/injected-wallets';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const { chains, provider } = configureChains(
  [baseGoerli],
  [
    /**
     * Tells wagmi to use the default RPC URL for each chain
     * for some dapps the higher rate limits of Alchemy may be required
     */
    infuraProvider({ apiKey: '4791c1745a1f44ce831e94be7f9e8bd7' }),
    jsonRpcProvider({
      rpc: (chain) => {
        return { http: chain.rpcUrls.default.http[0] };
      },
    }),
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'Basethetix',
  chains,
  projectId: '5075a2da602e17eec34aa77b40b321be',
});

const client = createClient({
  autoConnect: true,
  connectors: connectors,
  provider,
});

const apiKey = '1730eff0-9d50-4382-a3fe-89f0d34a2070';

const injected = injectedModule();

const infuraKey = '<INFURA_KEY>';
const rpcUrl = `https://mainnet.infura.io/v3/${infuraKey}`;

init({
  apiKey,
  wallets: [injected],
  chains: [
    {
      id: '0x2105',
      token: 'ETH',
      label: 'Base',
      rpcUrl: 'https://mainnet.base.org',
    },
    {
      id: '0x14a33',
      token: 'ETH',
      label: 'BaseGoerli',
      rpcUrl: 'https://goerli.base.org',
    },
  ],
});

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <WagmiConfig client={client}>
          <RainbowKitProvider
            chains={chains}
            theme={darkTheme({
              accentColor: '#0152ff',
              accentColorForeground: 'white',
              borderRadius: 'large',
              fontStack: 'system',
            })}
          >
            <Component {...pageProps} />
          </RainbowKitProvider>
        </WagmiConfig>
      </ChakraProvider>
      <Analytics />
    </QueryClientProvider>
  );
}

export default MyApp;
