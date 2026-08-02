import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { WEBHOOK_URL } from "@/lib/recruiter";

const allowedActions = z.enum([
  "SCORE_RESUME",
  "UI_INTERVIEW",
  "INTERVIEW_ANSWER",
  "VOICE_INTERVIEW",
]);

const jsonPayloadSchema = z
  .object({ action: allowedActions })
  .passthrough();

const MAX_RESUME_BYTES = 10 * 1024 * 1024;
const ALLOWED_RESUME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

function errorResponse(message: string, status: number) {
  return Response.json({ message }, { status });
}

async function proxyRecruiterRequest(request: Request) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "same-site") {
    return errorResponse("Cross-site requests are not allowed.", 403);
  }

  const contentType = request.headers.get("content-type") ?? "";
  let upstreamBody: BodyInit;
  let upstreamHeaders: HeadersInit | undefined;

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const action = allowedActions.safeParse(formData.get("action"));
    const resume = formData.get("resumeFile");

    if (!action.success || action.data !== "SCORE_RESUME") {
      return errorResponse("Invalid resume request.", 400);
    }
    if (!(resume instanceof File) || resume.size === 0) {
      return errorResponse("A resume file is required.", 400);
    }
    if (resume.size > MAX_RESUME_BYTES) {
      return errorResponse("The resume must be 10 MB or smaller.", 413);
    }
    if (resume.type && !ALLOWED_RESUME_TYPES.has(resume.type)) {
      return errorResponse("Upload a PDF, DOC, DOCX, or TXT resume.", 415);
    }

    upstreamBody = formData;
  } else if (contentType.includes("application/json")) {
    const parsed = jsonPayloadSchema.safeParse(await request.json());
    if (!parsed.success) return errorResponse("Invalid recruiter request.", 400);
    upstreamBody = JSON.stringify(parsed.data);
    upstreamHeaders = { "Content-Type": "application/json" };
  } else {
    return errorResponse("Unsupported request format.", 415);
  }

  try {
    const upstream = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: upstreamHeaders,
      body: upstreamBody,
      signal: AbortSignal.timeout(120_000),
    });
    const body = await upstream.text();

    if (!upstream.ok) {
      const detail = body.trim().slice(0, 300);
      return errorResponse(
        `Recruiter service returned ${upstream.status}.${detail ? ` ${detail}` : " Confirm the workflow is active."}`,
        502,
      );
    }

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (e) {
    const reason = e instanceof Error ? e.message : "unknown error";
    const timedOut = e instanceof Error && (e.name === "TimeoutError" || e.name === "AbortError");
    return errorResponse(
      timedOut
        ? "The recruiter service took too long to respond (over 2 minutes). Please try again."
        : `The recruiter service could not be reached (${reason}). Confirm the workflow is active and try again.`,
      504,
    );
  }
}

export const Route = createFileRoute("/api/public/recruiter")({
  server: {
    handlers: {
      POST: ({ request }) => proxyRecruiterRequest(request),
    },
  },
});