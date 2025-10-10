import { createRoot } from "react-dom/client";
import App from "./App";
// import SimpleApp from "./SimpleApp"; // 더 간단한 버전 사용
import "./index.css";

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
