export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="15" fill="#1d3d2f" />
      <path
        d="M16 7.5c4.2 2.2 7 6.4 7 11.2 0 1.8-.4 3.4-1.1 4.8-1.8-3.2-4.3-5.4-5.9-6.4v8.4h-1.8v-8.4c-1.6 1-4.1 3.2-5.9 6.4A11.3 11.3 0 0 1 8.4 18.7C8.4 13.9 11.8 9.7 16 7.5Z"
        fill="#e7f0e4"
      />
      <path
        d="M16 17.2c1.4.9 3.4 2.8 4.8 5.6-.8.7-1.8 1.2-2.9 1.5-1.1-1.8-1.7-3.4-1.9-4.4-.2 1-.8 2.6-1.9 4.4-1.1-.3-2.1-.8-2.9-1.5 1.4-2.8 3.4-4.7 4.8-5.6Z"
        fill="#c4a35a"
      />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-8 w-8" />
      <span className="inline-flex items-baseline gap-1.5">
        <span className="font-display text-[1.35rem] leading-none tracking-tight text-forest">
          Fasal
        </span>
        <span className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.2em] text-leaf">
          AI
        </span>
      </span>
    </span>
  );
}
