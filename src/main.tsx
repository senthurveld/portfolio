import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App";
import "./styles/globals.css";

// Stale chunk after deploy: reload once.
window.addEventListener("vite:preloadError", () => {
  try {
    if (sessionStorage.getItem("chunk-reload")) return;
    sessionStorage.setItem("chunk-reload", "1");
  } catch {
    return;
  }
  location.reload();
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
