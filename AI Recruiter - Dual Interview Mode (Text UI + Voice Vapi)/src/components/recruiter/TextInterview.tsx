import { useEffect, useRef, useState } from "react";
import { PartyPopper, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { postToWebhook, readMessage, type RecruiterResponse } from "@/lib/recruiter";
import type { Candidate } from "@/lib/candidate";

type ChatMessage = { role: "ai" | "candidate"; content: string };

const TOTAL_QUESTIONS = 25;

export function TextInterview({
  candidate,
  onReset,
}: {
  candidate: Candidate;
  onReset: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(true);
  const [complete, setComplete] = useState(false);
  const [outcome, setOutcome] = useState<"selected" | "rejected" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const sessionId = useRef(`session_${Date.now()}`);
  const started = useRef(false);
  const historyRef = useRef<ChatMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const applyResponse = (data: RecruiterResponse) => {
    const text = readMessage(data);
    if (text) {
      const next: ChatMessage = { role: "ai", content: text };
      historyRef.current = [...historyRef.current, next];
      setMessages((prev) => [...prev, next]);
    }
    if (typeof data.questionCount === "number") setQuestionCount(data.questionCount);
    else setQuestionCount((c) => Math.min(c + 1, TOTAL_QUESTIONS));

    if (data.stage === "FINAL_SELECTED" || data.decision === "SELECTED")
      setOutcome("selected");
    else if (data.stage === "FINAL_REJECTED" || data.decision === "REJECTED")
      setOutcome("rejected");

    if (
      data.stage === "INTERVIEW_COMPLETE" ||
      data.stage === "FINAL_SELECTED" ||
      data.stage === "FINAL_REJECTED"
    )
      setComplete(true);
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      try {
        const data = await postToWebhook({
          action: "UI_INTERVIEW",
          candidateName: candidate.candidateName,
          candidateEmail: candidate.candidateEmail,
          jobTitle: candidate.jobTitle,
          resumeSummary: candidate.resumeSummary,
          sessionId: sessionId.current,
          questionCount: 0,
          conversationHistory: "[]",
          message: "Start the interview. Introduce yourself and ask the first question.",
        });
        applyResponse(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not start the interview.");
      } finally {
        setBusy(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  const send = async () => {
    const answer = input.trim();
    if (!answer || busy || complete) return;
    const mine: ChatMessage = { role: "candidate", content: answer };
    historyRef.current = [...historyRef.current, mine];
    setMessages((prev) => [...prev, mine]);
    setInput("");
    setBusy(true);
    setError(null);
    try {
      const data = await postToWebhook({
        action: "INTERVIEW_ANSWER",
        candidateName: candidate.candidateName,
        candidateEmail: candidate.candidateEmail,
        jobTitle: candidate.jobTitle,
        resumeSummary: candidate.resumeSummary,
        sessionId: sessionId.current,
        questionCount,
        conversationHistory: JSON.stringify(historyRef.current),
        message: answer,
      });
      applyResponse(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send your answer.");
    } finally {
      setBusy(false);
    }
  };

  if (complete) {
    return (
      <section className="panel animate-rise-in p-8 text-center sm:p-12">
        <div className="mx-auto flex h-20 w-20 animate-pulse-ring items-center justify-center rounded-full bg-primary/15 text-primary">
          <PartyPopper className="h-10 w-10" strokeWidth={1.6} />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">Interview Complete! 🎉</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {outcome === "selected"
            ? "🎉 You've been selected! Check your email for confirmation."
            : outcome === "rejected"
              ? "Thank you for completing the interview. We'll be in touch."
              : "Results are being sent to HR."}
        </p>
        <Button onClick={onReset} variant="secondary" size="lg" className="mt-8">
          Back to start
        </Button>
      </section>
    );
  }

  return (
    <section className="panel flex h-[78vh] min-h-[520px] animate-rise-in flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h1 className="text-sm font-semibold">Text Interview</h1>
          <p className="text-xs text-muted-foreground">{candidate.jobTitle}</p>
        </div>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
          Question {Math.min(Math.max(questionCount, 1), TOTAL_QUESTIONS)} /{" "}
          {TOTAL_QUESTIONS}
        </span>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-6">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex animate-fade-in ${m.role === "candidate" ? "justify-end" : "justify-start"}`}
          >
            <p
              className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "candidate"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-secondary text-secondary-foreground rounded-bl-sm"
              }`}
            >
              {m.content}
            </p>
          </div>
        ))}
        {busy ? (
          <div className="flex justify-start">
            <span className="flex items-center gap-2 rounded-2xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
              <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
              Thinking…
            </span>
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      {error ? (
        <p className="mx-5 mb-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground">
          {error}
        </p>
      ) : null}

      <div className="flex items-end gap-2 border-t border-border p-4">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          rows={1}
          placeholder="Type your answer…"
          className="max-h-40 min-h-11 resize-none"
        />
        <Button
          onClick={() => void send()}
          disabled={busy || !input.trim()}
          size="icon"
          className="h-11 w-11 shrink-0"
          aria-label="Send answer"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
