"use server";

/**
 * The ONLY place that writes to the backend. All mutations (create, edit,
 * transition, attach document) go through here as Server Actions — no
 * component performs a raw `fetch`.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { API_BASE_URL } from "./config";
import type {
  Obligation,
  ObligationType,
  Status,
} from "@/types/obligation";

interface ErrorBody {
  detail?: string;
}

type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

async function send<T>(
  path: string,
  method: "POST" | "PATCH",
  payload: unknown
): Promise<ApiResult<T>> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch {
    return { ok: false, status: 0, message: "Could not reach the compliance API." };
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorBody | null;
    return {
      ok: false,
      status: response.status,
      message: body?.detail ?? `Request failed with status ${response.status}.`,
    };
  }

  return { ok: true, data: (await response.json()) as T };
}

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/** Redirects back to a form with the entered values and an error message,
 * so the (server-rendered) form can redisplay what the user typed. */
function redirectWithError(path: string, error: string, values: Record<string, string>): never {
  const params = new URLSearchParams(values);
  params.set("error", error);
  redirect(`${path}?${params.toString()}`);
}

export async function createObligation(formData: FormData): Promise<void> {
  const requiresDocument = formData.get("requiresDocument") === "on";
  const values = {
    type: readString(formData, "type"),
    title: readString(formData, "title"),
    description: readString(formData, "description"),
    dueDate: readString(formData, "dueDate"),
    owner: readString(formData, "owner"),
    companyTaxId: readString(formData, "companyTaxId"),
    requiresDocument: String(requiresDocument),
  };

  if (!values.title || !values.owner || !values.dueDate || !values.type || !values.companyTaxId) {
    return redirectWithError("/obligations/new", "Please fill in all required fields.", values);
  }

  const result = await send<Obligation>("/obligations", "POST", {
    type: values.type as ObligationType,
    title: values.title,
    description: values.description,
    dueDate: values.dueDate,
    owner: values.owner,
    requiresDocument,
    companyTaxId: values.companyTaxId,
  });

  if (!result.ok) {
    return redirectWithError("/obligations/new", result.message, values);
  }

  revalidatePath("/");
  redirect(`/obligations/${result.data.id}`);
}

export async function updateObligation(id: number, formData: FormData): Promise<void> {
  const requiresDocument = formData.get("requiresDocument") === "on";
  const values = {
    title: readString(formData, "title"),
    description: readString(formData, "description"),
    dueDate: readString(formData, "dueDate"),
    owner: readString(formData, "owner"),
    requiresDocument: String(requiresDocument),
  };
  const version = Number(readString(formData, "version"));

  if (!values.title || !values.owner || !values.dueDate) {
    return redirectWithError(`/obligations/${id}/edit`, "Please fill in all required fields.", values);
  }

  const result = await send<Obligation>(`/obligations/${id}`, "PATCH", {
    title: values.title,
    description: values.description,
    dueDate: values.dueDate,
    owner: values.owner,
    requiresDocument,
    version,
  });

  if (!result.ok) {
    return redirectWithError(`/obligations/${id}/edit`, result.message, values);
  }

  revalidatePath("/");
  revalidatePath(`/obligations/${id}`);
  redirect(`/obligations/${id}`);
}

export type TransitionResult =
  | { ok: true; status: Status; version: number; availableTransitions: Status[] }
  | { ok: false; message: string; conflict: boolean };

export async function transitionObligation(
  id: number,
  newStatus: Status,
  version: number
): Promise<TransitionResult> {
  const result = await send<Obligation>(`/obligations/${id}/transition`, "POST", {
    newStatus,
    version,
  });

  if (!result.ok) {
    const conflict = result.status === 409;
    return {
      ok: false,
      conflict,
      message: conflict
        ? "This obligation was modified elsewhere. Refresh and retry."
        : result.message,
    };
  }

  revalidatePath("/");
  revalidatePath(`/obligations/${id}`);
  return {
    ok: true,
    status: result.data.status,
    version: result.data.version,
    availableTransitions: result.data.availableTransitions,
  };
}

export async function attachDocument(id: number, formData: FormData): Promise<void> {
  const filename = readString(formData, "filename");
  const version = Number(readString(formData, "version"));

  if (!filename) {
    return redirectWithError(`/obligations/${id}`, "Please provide a filename.", {});
  }

  const result = await send<Obligation>(`/obligations/${id}/document`, "POST", {
    filename,
    version,
  });

  if (!result.ok) {
    return redirectWithError(`/obligations/${id}`, result.message, {});
  }

  revalidatePath("/");
  revalidatePath(`/obligations/${id}`);
  redirect(`/obligations/${id}`);
}
