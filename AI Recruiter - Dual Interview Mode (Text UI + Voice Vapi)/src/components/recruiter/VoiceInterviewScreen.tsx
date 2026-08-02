import { Mic } from "lucide-react";

export function VoiceInterviewScreen({
  onReset,
  dark = false,
}: {
  onReset: () => void;
  dark?: boolean;
}) {
  const heading = dark ? "text-[#f5f5f0]" : "text-foreground";
  const body = dark ? "text-[#8a9a8a]" : "text-muted-foreground";

  return (
    <section className={`animate-rise-in text-center ${dark ? "" : "panel p-8 sm:p-12"}`}>
      <div
        className={`mx-auto flex h-16 w-16 animate-pulse-ring items-center justify-center rounded-full ${
          dark ? "bg-[#4ade80]/15 text-[#4ade80]" : "bg-accent/10 text-accent"
        }`}
      >
        <Mic className="h-9 w-9" strokeWidth={1.6} />
      </div>
      <h1 className={`mt-5 font-serif text-2xl font-semibold tracking-tight ${heading}`}>
        Connecting your voice interview
      </h1>
      <p className={`mt-2 text-sm ${body}`}>
        Your voice interview is being connected. Please stay on this page and answer when
        the call begins.
      </p>

      <p className={`mt-4 text-xs ${body}`}>
        Make sure your microphone is enabled. Interview takes 30–40 minutes.
      </p>

      <button
        onClick={onReset}
        className={`mt-6 text-xs font-medium underline-offset-4 hover:underline ${body}`}
      >
        Start over
      </button>
    </section>
  );
}
