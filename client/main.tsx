import { createRoot } from "react-dom/client";
import { App } from "./App";

// Suppress Firebase AbortError warnings in development
// This error is expected when components unmount during pending requests
if (process.env.NODE_ENV === "development") {
  // Suppress unhandled rejection for Firebase AbortError
  window.addEventListener("unhandledrejection", (event) => {
    if (
      event.reason instanceof Error &&
      (event.reason.name === "AbortError" ||
        event.reason.message.includes("aborted"))
    ) {
      event.preventDefault();
    }
  });

  // Also suppress console errors for Firebase internal stream errors
  const originalError = console.error;
  console.error = (...args) => {
    const errorStr = String(args[0]);
    if (
      errorStr.includes("AbortError") &&
      errorStr.includes("signal is aborted")
    ) {
      return; // Suppress this specific error
    }
    originalError.apply(console, args);
  };
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(<App />);
