import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App";
import "./index.css";

Sentry.init({
  dsn: "https://16620b9f39178be95f10f27f5276d008@o4511142133760000.ingest.us.sentry.io/4511142158991360",
  environment: import.meta.env.MODE,
  release: "datasist@3.0.0",
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  tracesSampleRate: 0.5,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.05,
  sendDefaultPii: false,
});

if (!window.location.hash) {
  window.location.hash = "#/";
}

createRoot(document.getElementById("root")!).render(<App />);
