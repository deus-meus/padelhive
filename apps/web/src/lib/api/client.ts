import { treaty } from "@elysiajs/eden";
import { env as publicEnv } from "$env/dynamic/public";
import type { App } from "../../../../api/src/index";

const env = {
  ...publicEnv,
  ...((typeof import.meta !== "undefined" && import.meta.env) || {}),
} as unknown as Record<string, string | undefined>;

const getApiUrl = (): string => {
  let url =
    env.PUBLIC_API_URL ||
    env.VITE_API_URL ||
    env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3001";

  // If running in browser and API URL defaults to localhost, adapt to current hostname
  if (
    typeof window !== "undefined" &&
    url.includes("localhost") &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    url = url.replace("localhost", window.location.hostname);
  }

  return url.replace(/\/api\/?$/, "").replace(/\/$/, "");
};

export const API_URL = getApiUrl();

const traceFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const startTime = performance.now();
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;
  const method = init?.method || "GET";

  const reqId = `client_${Math.random().toString(36).slice(2, 10)}`;
  const headers = new Headers(init?.headers);
  if (!headers.has("x-request-id")) {
    headers.set("x-request-id", reqId);
  }

  const updatedInit = { ...init, headers };

  try {
    const response = await fetch(input, updatedInit);
    const duration = Math.round(performance.now() - startTime);
    const status = response.status;
    const serverReqId = response.headers.get("x-request-id") || reqId;
    const timestamp = new Date().toISOString();

    // Log in terminal process (Node/Bun SSR process)
    if (typeof window === "undefined") {
      const isProd = process.env.NODE_ENV === "production";
      if (isProd) {
        const level = status >= 500 ? "ERROR" : status >= 400 ? "WARN" : "INFO";
        const logPayload = JSON.stringify({
          timestamp,
          level: `API_${level}`,
          reqId: serverReqId,
          method,
          url,
          status,
          durationMs: duration,
        });
        if (status >= 500) console.error(logPayload);
        else if (status >= 400) console.warn(logPayload);
        else console.log(logPayload);
      } else {
        const formattedTime = timestamp.replace("T", " ").slice(0, 19);
        if (status >= 500) {
          console.error(
            `[${formattedTime}] [API ERROR] [${serverReqId}] ${method} ${url} ${status} - ${duration}ms`,
          );
        } else if (status >= 400) {
          console.warn(
            `[${formattedTime}] [API WARN] [${serverReqId}] ${method} ${url} ${status} - ${duration}ms`,
          );
        } else {
          console.log(
            `[${formattedTime}] [API INFO] [${serverReqId}] ${method} ${url} ${status} - ${duration}ms`,
          );
        }
      }
    }

    return response;
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    const timestamp = new Date().toISOString();
    if (typeof window === "undefined") {
      console.error(
        `[${timestamp.replace("T", " ").slice(0, 19)}] [API ERROR] [${reqId}] ${method} ${url} FAILED - ${duration}ms (${String(error)})`,
      );
    }
    throw error;
  }
};

export const client = treaty<App>(API_URL, {
  fetcher: traceFetch as typeof fetch,
});
export const api = client.api;
