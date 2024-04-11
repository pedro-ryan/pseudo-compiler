import { ThemeProvider } from "@/components/theme-provider.tsx";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark">
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
