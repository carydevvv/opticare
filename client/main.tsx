// Suppress Firebase AbortError warnings immediately on page load
// This must run before any other scripts load
{
  // Helper function to check if an error is a Firebase AbortError
  const isFirebaseAbortError = (error: any): boolean => {
    if (error instanceof Error) {
      return (
        error.name === "AbortError" ||
        error.message.includes("AbortError") ||
        error.message.includes("signal is aborted") ||
        error.message.includes("Stream was cancelled")
      );
    }
    const errorStr = String(error);
    return (
      errorStr.includes("AbortError") ||
      errorStr.includes("signal is aborted") ||
      errorStr.includes("Stream was cancelled")
    );
  };

  // Suppress Firebase AbortError warnings globally
  // This error is expected when components unmount during pending requests
  const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
    if (isFirebaseAbortError(event.reason)) {
      event.preventDefault();
    }
  };

  const errorHandler = (event: ErrorEvent) => {
    if (
      isFirebaseAbortError(event.error) ||
      isFirebaseAbortError(event.message)
    ) {
      event.preventDefault();
      return true;
    }
  };

  window.addEventListener("unhandledrejection", unhandledRejectionHandler);
  window.addEventListener("error", errorHandler, true);

  // Patch console methods to suppress Firebase AbortError logs
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;

  const shouldSuppress = (...args: any[]): boolean => {
    return args.some((arg) => isFirebaseAbortError(arg));
  };

  console.error = function (...args: any[]) {
    if (!shouldSuppress(...args)) {
      originalError.apply(this, args);
    }
  };

  console.warn = function (...args: any[]) {
    if (!shouldSuppress(...args)) {
      originalWarn.apply(this, args);
    }
  };

  // Also suppress if it appears in logs with a specific pattern
  console.log = function (...args: any[]) {
    if (!shouldSuppress(...args)) {
      originalLog.apply(this, args);
    }
  };
}

import { createRoot } from "react-dom/client";
import { App } from "./App";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(<App />);
