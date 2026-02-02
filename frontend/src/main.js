// src/main.js
// ============================================================
// React Entry Point
// Mounts the <App /> component into the DOM.
// Imports the global Tailwind CSS stylesheet.
// ============================================================

import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";  // Tailwind CSS
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
