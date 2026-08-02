import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RejectScreen({
  candidateName,
  score,
  onReset,
  dark = false,
}: {
  candidateName: string;
  score?: number;
  onReset: () => void;
  dark?: boolean;
}) {
  const heading = dark ? "text-[#f5f5f0]" : "text-foreground";
  const body = dark ? "text-[#8a9a8a]" : "text-muted-foreground";

  return (
    <section
      className={`animate-rise-in text-center ${dark ? "" : "panel p-8 sm:p-12"}`}
    >
      <div
        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
          dark ? "bg-[#f87171]/15 text-[#f87171]" : "bg-destructive/10 text-destructive"
        }`}
      >
        <XCircle className="h-9 w-9" strokeWidth={1.6} />
      </div>
      <h1 className={`mt-5 font-serif text-2xl font-semibold tracking-tight ${heading}`}>
        Thank You for Applying
      </h1>
      <p className={`mt-2 text-sm ${body}`}>
        Unfortunately, you were not selected at this time.
      </p>

      {candidateName ? (
        <p className={`mt-5 text-base font-semibold ${heading}`}>{candidateName}</p>
      ) : null}
      {typeof score === "number" ? (
        <p className={`mt-1 text-sm font-medium ${body}`}>
          Your Score:{" "}
          <span className={dark ? "font-semibold text-[#f87171]" : "font-semibold text-destructive"}>
            {score}/100
          </span>
        </p>
      ) : null}

      <Button
        onClick={onReset}
        size="lg"
        variant="secondary"
        className={`mt-7 ${
          dark
            ? "border border-[#f5f5f0]/30 bg-transparent text-[#f5f5f0] hover:bg-[#f5f5f0]/10"
            : ""
        }`}
      >
        Apply for Another Position
      </Button>
    </section>
  );
}
