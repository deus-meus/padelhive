import { treaty } from "@elysiajs/eden";
const __vite_import_meta_env__ = {};
const API_URL = typeof import.meta !== "undefined" && __vite_import_meta_env__?.VITE_API_URL || "http://localhost:3001";
const client = treaty(API_URL);
const api = client.api;
export {
  api as a
};
