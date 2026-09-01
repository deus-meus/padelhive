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

export const client = treaty<App>(API_URL);
export const api = client.api;
