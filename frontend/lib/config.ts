/** Server-only: never bundled for the client, so the backend URL never leaks to the browser. */
import "server-only";

const rawBaseUrl = process.env.API_BASE_URL ?? "http://localhost:8000";

export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");
