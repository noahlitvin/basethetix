import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors: {
    background: "#0a0b0c",
    text: "#ffffff",
    blue: {
      500: "#0152ff",
    },
  },
  fonts: {
    heading: "Raleway, sans-serif",
    body: "Raleway, sans-serif",
    mono: "Raleway, sans-serif",
  },
  components: {
    Link: {
      baseStyle: {
        borderBottom: "1px solid #ffffff",
        _hover: { textDecoration: "none" },
      },
    },
    Modal: {
      baseStyle: () => ({
        dialog: {
          color: "#0a0b0c",
        },
      }),
    },
  },
  styles: {
    global: {
      body: {
        bg: "#0a0b0c",
        color: "#ffffff",
      },
    },
  },
});

export default theme;
