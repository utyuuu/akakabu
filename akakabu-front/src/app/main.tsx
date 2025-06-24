import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, useRoutes, HashRouter } from "react-router-dom";
import { routes } from "./root"; // `root.ts` をインポート
import './index.css';

function App() {
  return useRoutes(routes); // ルートを適用
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);