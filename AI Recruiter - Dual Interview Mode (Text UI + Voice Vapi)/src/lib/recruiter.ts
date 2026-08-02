export const WEBHOOK_URL =
  "https://asadullah-xyz.app.n8n.cloud/webhook/ai-recruiter";

const RECRUITER_API_URL = "/api/public/recruiter";

export type RecruiterResponse = {
  decision?: "ACCEPT" | "REJECT" | string;
  stage?: string;
  score?: number;
  atsScore?: number;
  candidateName?: string;
  candidateEmail?: string;
  jobTitle?: string;
  resumeSummary?: string;
  message?: string;
  reply?: string;
  question?: string;
  questionCount?: number;
  interviewLink?: string;
  [key: string]: unknown;
};

export async function postToWebhook(
  payload: Record<string, unknown>,
): Promise<RecruiterResponse> {
  const res = await fetch(RECRUITER_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`Request failed (${res.status}). ${raw.slice(0, 200)}`);
  }

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { message: raw };
  }

  if (Array.isArray(data)) return (data[0] ?? {}) as RecruiterResponse;
  return (data ?? {}) as RecruiterResponse;
}

/**
 * Sends the form fields plus the uploaded resume as multipart/form-data.
 *
 * n8n SETUP NOTE: the webhook node for workflow
 * 0927d18a-cded-4866-941c-d91cd5a84fe9 (ai-recruiter) must be configured with:
 *   - httpMethod: POST
 *   - responseMode: lastNode
 *   - "Binary Data" / "Binary Property" enabled so the uploaded file arrives as a
 *     binary attachment (field name: "resumeFile") alongside the text form fields.
 * Without binary data enabled, the file will be dropped by n8n.
 */
export async function postToWebhookWithFile(
  payload: Record<string, unknown>,
  file: File,
): Promise<RecruiterResponse> {
  const formData = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (v !== undefined && v !== null) formData.append(k, String(v));
  });
  formData.append("resumeFile", file);

  const res = await fetch(RECRUITER_API_URL, { method: "POST", body: formData });
  const raw = await res.text();
  if (!res.ok) throw new Error(`Request failed (${res.status}). ${raw.slice(0, 200)}`);
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { message: raw };
  }
  if (Array.isArray(data)) return (data[0] ?? {}) as RecruiterResponse;
  return (data ?? {}) as RecruiterResponse;
}

export function readScore(r: RecruiterResponse): number | undefined {
  const value = r.score ?? r.atsScore;
  return typeof value === "number" ? value : undefined;
}

export function readMessage(r: RecruiterResponse): string {
  const keys = ["response", "message", "reply", "question", "output", "text", "answer"];
  for (const k of keys) {
    const v = r[k];
    if (typeof v === "string" && v.trim()) return v;
  }
  return "";
}
