import { treaty } from "@elysiajs/eden";
import type { App } from "../../../../api/src/index";

export const API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:3001";

export const client = treaty<App>(API_URL);
export const api = client.api;
