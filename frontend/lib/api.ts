/**
 * The ONLY place that reads from the backend. Every Server Component that
 * needs data goes through here — no component performs a raw `fetch`.
 */
import "server-only";

import { API_BASE_URL } from "./config";
import type {
  Obligation,
  ObligationSummary,
  ObligationType,
  Status,
} from "@/types/obligation";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface ErrorBody {
  detail?: string;
}

async function get<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, "Could not reach the compliance API.");
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorBody | null;
    throw new ApiError(
      response.status,
      body?.detail ?? `Request failed with status ${response.status}.`
    );
  }

  return (await response.json()) as T;
}

export interface ListObligationsParams {
  status?: Status;
  type?: ObligationType;
  overdue?: boolean;
}

export function listObligations(
  params: ListObligationsParams = {}
): Promise<Obligation[]> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.type) query.set("type", params.type);
  if (params.overdue !== undefined) query.set("overdue", String(params.overdue));

  const qs = query.toString();
  return get<Obligation[]>(`/obligations${qs ? `?${qs}` : ""}`);
}

export function getObligation(id: number): Promise<Obligation> {
  return get<Obligation>(`/obligations/${id}`);
}

export function getObligationSummary(): Promise<ObligationSummary> {
  return get<ObligationSummary>("/obligations/summary");
}
