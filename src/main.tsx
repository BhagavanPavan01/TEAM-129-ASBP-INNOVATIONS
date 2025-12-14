import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Add error boundary for better debugging
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Wrap App in a simple error boundary
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  try {
    return <>{children}</>;
  } catch (error) {
    console.error("Error in app:", error);
    return <div style={{ padding: '20px', color: 'red' }}>Error loading app: {String(error)}</div>;
  }
};

createRoot(rootElement).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);