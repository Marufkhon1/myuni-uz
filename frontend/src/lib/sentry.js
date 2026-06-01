import * as Sentry from "@sentry/react";
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import { useEffect } from "react";

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN?.trim() || "";
const SENTRY_ENV = import.meta.env.VITE_SENTRY_ENVIRONMENT?.trim() || import.meta.env.MODE;

export function isSentryEnabled() {
  return Boolean(SENTRY_DSN);
}

export function initSentry() {
  if (!SENTRY_DSN || typeof window === "undefined") {
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENV,
    integrations: [
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
      Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
    ],
    tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: Number(import.meta.env.VITE_SENTRY_REPLAY_SAMPLE_RATE ?? 0.1),
    sendDefaultPii: false,
    ignoreErrors: ["ResizeObserver loop limit exceeded", "ResizeObserver loop completed"],
  });
}

export function captureException(error, context) {
  if (!SENTRY_DSN) {
    return;
  }
  Sentry.captureException(error, context);
}

export { Sentry };
