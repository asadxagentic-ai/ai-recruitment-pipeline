import { CheckCircle2, MessageSquareText, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Confetti } from "./Confetti";

export function CongratsScreen({
  candidateName,
  score,
  onText,
  onVoice,
  dark = false,
}: {
  candidateName: string;
  score?: number;
  onText: () => void;
  onVoice: () => void;
  dark?: boolean;
}) {
  const heading = dark ? "text-[#f5f5f0]" : "text-foreground";
  const body = dark ? "text-[#8a9a8a]" : "text-muted-foreground";
  const cardCls = dark
    ? "border-[#2c4a2d] bg-[#16281a]"
    : "border-border bg-secondary/60";

  return (
    <section className="relative animate-rise-in">
      <Confetti />
      <div className={`relative text-center ${dark ? "" : "panel p-8 sm:p-12"}`}>
        <div
          className={`mx-auto flex h-16 w-16 animate-pulse-ring items-center justify-center rounded-full ${
            dark ? "bg-[#4ade80]/15 text-[#4ade80]" : "bg-primary/10 text-primary"
          }`}
        >
          <CheckCircle2 className="h-9 w-9" strokeWidth={1.6} />
        </div>

        <h1
          className={`mt-5 font-serif text-2xl font-semibold tracking-tight ${heading}`}
        >
          Congratulations, {candidateName}!
        </h1>
        <p className={`mt-2 text-sm ${body}`}>
          You passed the ATS screening
          {typeof score === "number" ? (
            <>
              {" "}
              with a score of{" "}
              <span className={dark ? "font-semibold text-[#4ade80]" : "font-semibold text-primary"}>
                {score}/100
              </span>
            </>
          ) : null}
        </p>
        <p className={`mt-5 text-sm font-medium ${dark ? "text-[#d6ded6]" : "text-foreground"}`}>
          Choose how you'd like to proceed:
        </p>

        <div className="mt-6 grid gap-4 text-left">
          <article className={`flex flex-col rounded-xl border p-5 ${cardCls}`}>
            <h2 className={`flex items-center gap-2 text-base font-semibold ${heading}`}>
              <MessageSquareText
                className={`h-4 w-4 ${dark ? "text-[#4ade80]" : "text-primary"}`}
              />
              Text Interview
            </h2>
            <p className={`mt-1 flex-1 text-xs ${body}`}>
              25 questions answered in the chat interface at your own pace
            </p>
            <Button
              onClick={onText}
              className={`mt-4 w-full font-semibold ${
                dark ? "bg-[#4ade80] text-[#0f1f10] hover:bg-[#4ade80]/90" : ""
              }`}
            >
              Start Text Interview
            </Button>
          </article>

          <article className={`flex flex-col rounded-xl border p-5 ${cardCls}`}>
            <h2 className={`flex items-center gap-2 text-base font-semibold ${heading}`}>
              <Mic className={`h-4 w-4 ${dark ? "text-[#4ade80]" : "text-accent"}`} />
              Voice Interview
            </h2>
            <p className={`mt-1 flex-1 text-xs ${body}`}>
              Real-time AI voice interview — complete in 30–40 minutes
            </p>
            <Button
              onClick={onVoice}
              variant="secondary"
              className={`mt-4 w-full font-semibold ${
                dark
                  ? "border border-[#4ade80]/40 bg-transparent text-[#f5f5f0] hover:bg-[#4ade80]/10"
                  : ""
              }`}
            >
              Start Voice Interview
            </Button>
          </article>
        </div>
      </div>
    </section>
  );
}
