import React from "react";
import { createRoot } from "react-dom/client";
import App from "./bootstrap/App";
import "./index.css";
import Bootstrap from "./bootstrap";

const container = document.getElementById("root")!;
const root = createRoot(container);
root.render(
    <React.StrictMode>
        <Bootstrap />
    </React.StrictMode>
);
