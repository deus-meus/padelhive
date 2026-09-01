import { treaty } from "@elysiajs/eden";
import { env as publicEnv } from "$env/dynamic/public";
import type { App } from "../../../../api/src/index";

const env = {
  ...publicEnv,
  ...((typeof import.meta !== "undefined" && import.meta.env) || {}),
} as unknown as Record<string, string | undefined>;

const rawApiUrl =
  env.PUBLIC_API_URL ||
  env.VITE_API_URL ||
  env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

export const API_URL = rawApiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");

const traceFetch: typeof fetch = async (input, init) => {
  const startTime = performance.now();
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;
  const method = init?.method || "GET";

  try {
    const response = await fetch(input, init);
    const duration = Math.round(performance.now() - startTime);
    const status = response.status;
    const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);

    // Only print trace logs in Terminal process (Server-side SSR / Bun / Node process)
    if (typeof window === "undefined") {
      if (status >= 500) {
        console.error(
          `[${timestamp}] [API ERROR] ${method} ${url} ${status} - ${duration}ms`,
        );
      } else if (status >= 400) {
        console.warn(
          `[${timestamp}] [API WARN] ${method} ${url} ${status} - ${duration}ms`,
        );
      } else {
        console.log(
          `[${timestamp}] [API INFO] ${method} ${url} ${status} - ${duration}ms`,
        );
      }
    }

    return response;
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);
    if (typeof window === "undefined") {
      console.error(
        `[${timestamp}] [API ERROR] ${method} ${url} FAILED - ${duration}ms (${String(error)})`,
      );
    }
    throw error;
  }
};

export const client = treaty<App>(API_URL, { fetcher: traceFetch });
export const api = client.api;
