import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import type { AppProps } from "next/app";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { goerli, baseGoerli } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import theme from "../theme";
import { Analytics } from "@vercel/analytics/react";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    baseGoerli,
    //...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? [goerli] : []),
  ],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "Basethetix",
  projectId: "YOUR_PROJECT_ID",
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider
            chains={chains}
            theme={darkTheme({
              accentColor: "#0152ff",
              accentColorForeground: "white",
              borderRadius: "large",
              fontStack: "system",
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
