import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CongratsScreen } from "@/components/recruiter/CongratsScreen";
import { RejectScreen } from "@/components/recruiter/RejectScreen";
import { ResumeForm, type ResumeFormValues } from "@/components/recruiter/ResumeForm";
import { Spinner } from "@/components/recruiter/Spinner";
import { TextInterview } from "@/components/recruiter/TextInterview";
import { VoiceInterviewScreen } from "@/components/recruiter/VoiceInterviewScreen";
import type { Candidate } from "@/lib/candidate";
import { postToWebhook, postToWebhookWithFile, readScore } from "@/lib/recruiter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Recruiter — Instant Resume Screening & AI Interviews" },
      {
        name: "description",
        content:
          "Upload your resume for instant AI ATS scoring, then complete a text or voice interview.",
      },
      { property: "og:title", content: "AI Recruiter — Instant Resume Screening" },
      {
        property: "og:description",
        content:
          "Upload your resume, get an instant AI ATS score, and continue into a text or voice interview.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Step =
  | "form"
  | "scoring"
  | "reject"
  | "choose"
  | "text"
  | "voice-loading"
  | "voice-ready";

function Index() {
  const [step, setStep] = useState<Step>("form");
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState<number | undefined>();
  const [candidate, setCandidate] = useState<Candidate>({
    candidateName: "",
    candidateEmail: "",
    jobTitle: "",
    resumeSummary: "",
  });

  const reset = () => {
    setStep("form");
    setError(null);
    setScore(undefined);
  };

  const submitResume = async (values: ResumeFormValues) => {
    if (!values.resumeFile) return;
    setError(null);
    setStep("scoring");
    try {
      const data = await postToWebhookWithFile(
        {
          action: "SCORE_RESUME",
          candidateName: values.candidateName,
          candidateEmail: values.candidateEmail,
          jobTitle: values.jobTitle,
        },
        values.resumeFile,
      );

      setCandidate({
        candidateName: data.candidateName || values.candidateName,
        candidateEmail: data.candidateEmail || values.candidateEmail,
        jobTitle: data.jobTitle || values.jobTitle,
        resumeSummary: data.resumeSummary || "",
      });
      setScore(readScore(data));

      if (data.decision === "REJECT") setStep("reject");
      else if (data.decision === "ACCEPT") setStep("choose");
      else {
        setError("Unexpected response from the recruiter service. Please try again.");
        setStep("form");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setStep("form");
    }
  };

  const startVoice = async () => {
    setStep("voice-loading");
    try {
      await postToWebhook({ action: "VOICE_INTERVIEW", ...candidate });
      setStep("voice-ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not set up the voice interview.");
      setStep("choose");
    }
  };

  return (
    <div style={{ backgroundColor: "#F5F0E8", minHeight: "100vh" }}>
      <header className="flex items-center px-8 pt-8 pb-0">
        <div className="flex items-center gap-2">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle cx="10" cy="10" r="9" stroke="#1a3a1a" strokeWidth="1.5" />
            <circle cx="10" cy="10" r="3" stroke="#1a3a1a" strokeWidth="1.5" />
            <line x1="10" y1="1" x2="10" y2="4" stroke="#1a3a1a" strokeWidth="1.5" />
            <line x1="10" y1="16" x2="10" y2="19" stroke="#1a3a1a" strokeWidth="1.5" />
            <line x1="1" y1="10" x2="4" y2="10" stroke="#1a3a1a" strokeWidth="1.5" />
            <line x1="16" y1="10" x2="19" y2="10" stroke="#1a3a1a" strokeWidth="1.5" />
          </svg>
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
              fontSize: "1.1rem",
              color: "#1a1a1a",
              fontWeight: 600,
            }}
          >
            AI Recruiter
          </span>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-8 py-8 lg:flex-row">
        {/* LEFT COLUMN */}
        <div className="flex-1 lg:w-[55%]">
          <div className="mb-6">
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#1a1a1a",
                color: "#fff",
                fontSize: "0.65rem",
                fontFamily: "'Inter', sans-serif",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                padding: "4px 12px",
                borderRadius: "999px",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#4ade80",
                  display: "inline-block",
                }}
              />
              AI-Powered Screening
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2.2rem, 4vw, 3.5rem)",
              lineHeight: 1.15,
              color: "#1a1a1a",
              marginBottom: "1.25rem",
              fontWeight: 700,
            }}
          >
            Find the candidates{" "}
            <em style={{ color: "#1a3a1a", fontStyle: "italic" }}>nobody is</em>{" "}
            <em style={{ color: "#1a3a1a", fontStyle: "italic" }}>overlooking,</em> in one
            screen.
          </h1>

          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.875rem",
              color: "#6b6b6b",
              lineHeight: 1.7,
              marginBottom: "2rem",
              maxWidth: "480px",
            }}
          >
            Upload your resume and drop in your job title. Our workflow scores your fit
            instantly, then routes you into a text or voice interview the moment you
            qualify.
          </p>

          <div
            style={{
              background: "#FDFAF5",
              border: "1px solid #D9D4C7",
              borderRadius: "12px",
              padding: "2rem",
            }}
          >
            <div style={{ marginBottom: "1.25rem" }}>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.65rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#9a9a9a",
                  marginBottom: "0.25rem",
                }}
              >
                01 Compose
              </p>
              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1.4rem",
                  fontWeight: 600,
                  color: "#1a1a1a",
                }}
              >
                Brief the AI
              </h2>
            </div>

            <ResumeForm onSubmit={submitResume} error={error} />
          </div>

          <ul
            style={{
              marginTop: "1.25rem",
              paddingLeft: 0,
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem",
            }}
          >
            {[
              "Scores your resume against the role using AI.",
              "Filters unqualified candidates automatically.",
              "Routes accepted candidates to text or voice interview.",
              "Sends evaluation report to HR the moment you finish.",
            ].map((b) => (
              <li
                key={b}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.8rem",
                  color: "#6b6b6b",
                  display: "flex",
                  gap: "0.5rem",
                }}
              >
                <span style={{ color: "#1a3a1a", flexShrink: 0 }}>•</span> {b}
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT COLUMN — dark output panel */}
        <div
          className="lg:w-[45%]"
          style={{
            background: "#0f1f10",
            borderRadius: "12px",
            padding: "2rem",
            minHeight: "520px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ marginBottom: "1rem" }}>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.6rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#4ade80",
                opacity: 0.7,
                marginBottom: "0.5rem",
              }}
            >
              02 Result
            </p>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.75rem",
                color: "#f5f5f0",
                fontWeight: 600,
              }}
            >
              AI Output
            </h2>
          </div>

          <div
            style={{
              flex: 1,
              background: "#1a2e1b",
              borderRadius: "8px",
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {step === "form" && (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "0.75rem",
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#f59e0b",
                      display: "inline-block",
                      animation: "pulse 2s infinite",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.6rem",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "#a0a090",
                    }}
                  >
                    Waiting for your resume
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.85rem",
                    color: "#8a9a8a",
                    lineHeight: 1.7,
                  }}
                >
                  Fill in your details and hit <em>Submit Resume</em>. Your ATS score and
                  interview routing will appear here.
                </p>
              </div>
            )}
            {step === "scoring" && <Spinner label="Analyzing your resume with AI..." />}
            {step === "reject" && (
              <RejectScreen
                candidateName={candidate.candidateName}
                score={score}
                onReset={reset}
                dark
              />
            )}
            {step === "choose" && (
              <CongratsScreen
                candidateName={candidate.candidateName}
                score={score}
                onText={() => setStep("text")}
                onVoice={() => void startVoice()}
                dark
              />
            )}
            {step === "text" && <TextInterview candidate={candidate} onReset={reset} />}
            {step === "voice-loading" && (
              <Spinner label="Setting up your voice interview..." />
            )}
            {step === "voice-ready" && (
              <VoiceInterviewScreen onReset={reset} dark />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
