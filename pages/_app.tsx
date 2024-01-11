import '@rainbow-me/rainbowkit/styles.css';
import {
  RainbowKitProvider,
  darkTheme,
  getDefaultWallets,
} from '@rainbow-me/rainbowkit';

import type { AppProps } from 'next/app';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { base, baseGoerli } from 'wagmi/chains';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import theme from '../theme';
import { Analytics } from '@vercel/analytics/react';
import { useEffect, useState } from 'react';

import { infuraProvider } from 'wagmi/providers/infura';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { INFURA_WEB3_API_KEY } from '../constants/provider';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [base, baseGoerli],
  [
    /**
     * Tells wagmi to use the default RPC URL for each chain
     * for some dapps the higher rate limits of Alchemy may be required
     */
    infuraProvider({ apiKey: INFURA_WEB3_API_KEY }),
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
  projectId: '14f72ee1399549020ac5a3e39b29c4b2',
});

const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
  connectors,
});

function MyApp({ Component, pageProps }: AppProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <WagmiConfig config={config}>
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
    </>
  );
}

export default MyApp;
