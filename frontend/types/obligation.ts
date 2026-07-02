/**
 * Passive mirror of `backend/src/schemas/responses.py` and `requests.py`.
 * Describes the SHAPE of the API contract only — no rules, no derived logic.
 */

export type Status = "pending" | "in_progress" | "submitted" | "done";

export const STATUSES: Status[] = ["pending", "in_progress", "submitted", "done"];

export type ObligationType =
  | "annual_report"
  | "franchise_tax"
  | "boi_report"
  | "registered_agent_renewal";

export const OBLIGATION_TYPES: ObligationType[] = [
  "annual_report",
  "franchise_tax",
  "boi_report",
  "registered_agent_renewal",
];

export interface AuditEntry {
  fromStatus: Status;
  toStatus: Status;
  at: string;
}

/** Full obligation shape returned by both the list and detail endpoints. */
export interface Obligation {
  id: number;
  type: ObligationType;
  title: string;
  description: string;
  status: Status;
  dueDate: string;
  owner: string;
  requiresDocument: boolean;
  documentFilename: string | null;
  companyTaxId: string;
  version: number;
  isOverdue: boolean;
  availableTransitions: Status[];
  history: AuditEntry[];
}

export type ObligationDetail = Obligation;

export interface ObligationSummary {
  total: number;
  byStatus: Record<Status, number>;
  overdue: number;
  dueSoon: number;
}

export interface CreateObligationInput {
  type: ObligationType;
  title: string;
  description: string;
  dueDate: string;
  owner: string;
  requiresDocument: boolean;
  companyTaxId: string;
}

export interface UpdateObligationInput {
  title?: string;
  description?: string;
  dueDate?: string;
  owner?: string;
  requiresDocument?: boolean;
  version: number;
}
