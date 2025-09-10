import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import store from "./redux/store";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import createAdminTheme from "./theme/adminTheme";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";

import "./index.css";

import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";

const root = ReactDOM.createRoot(document.getElementById("root"));

const AppWithTheme = () => {
  const { darkMode } = useTheme();
  const theme = createAdminTheme(darkMode ? 'dark' : 'light');

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <App />
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 5000,
          style: {
            background: darkMode ? '#363636' : '#ffffff',
            color: darkMode ? '#fff' : '#000',
            border: darkMode ? '1px solid #555' : '1px solid #ddd',
          },
          success: {
            duration: 3000,
            style: {
              background: '#4caf50',
              color: '#fff',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#f44336',
              color: '#fff',
            },
          },
        }}
      />
    </MuiThemeProvider>
  );
};

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <AppWithTheme />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
