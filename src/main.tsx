import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

import { ThemeProvider, CssBaseline, createTheme, responsiveFontSizes } from "@mui/material";
import theme from "./theme";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// クエリクライアントのインスタンス作成
const queryClient = new QueryClient();

const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
const themeWithMatchMedia = {
  ...theme,
  components: {
    ...theme.components,
  },

  unstable_sxConfig: {
    ssrMatchMedia: (query: string) => ({
      matches: window.matchMedia(query).matches,
    }),
  },
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={themeWithMatchMedia}>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
