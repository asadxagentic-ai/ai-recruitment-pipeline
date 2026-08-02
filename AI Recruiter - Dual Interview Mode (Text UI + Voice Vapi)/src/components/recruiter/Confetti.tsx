const PIECES = Array.from({ length: 44 }, (_, i) => i);
const COLORS = ["bg-primary", "bg-accent", "bg-chart-4", "bg-chart-2", "bg-chart-5"];

export function Confetti() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-80 overflow-hidden"
    >
      {PIECES.map((i) => {
        const left = (i * 37) % 100;
        const delay = (i % 11) * 0.28;
        const duration = 3.4 + ((i * 7) % 25) / 10;
        return (
          <span
            key={i}
            className={`absolute top-[-20px] h-2.5 w-1.5 rounded-[1px] opacity-90 animate-confetti ${COLORS[i % COLORS.length]}`}
            style={{
              left: `${left}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        );
      })}
    </div>
  );
}
