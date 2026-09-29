export function HeroVisual() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-line bg-paper p-5 sm:p-7">
      <svg
        viewBox="0 0 420 420"
        className="h-auto w-full"
        role="img"
        aria-label="Abstract field with connected crop signals forming an emerging pattern"
      >
        <rect width="420" height="420" rx="20" fill="#eef3ea" />
        {Array.from({ length: 9 }).map((_, index) => (
          <path
            key={index}
            d={`M20 ${70 + index * 32} C 140 ${58 + index * 32}, 280 ${82 + index * 32}, 400 ${70 + index * 32}`}
            fill="none"
            stroke="#2f5d3a"
            strokeOpacity="0.12"
            strokeWidth="1.4"
          />
        ))}
        <path
          d="M78 286c38-92 86-148 132-176 18 28 42 86 28 168-48 8-106 14-160 8Z"
          fill="#2f5d3a"
          fillOpacity="0.14"
        />
        <path
          d="M210 92c52 32 88 92 88 158 0 18-3 34-9 48-22-42-54-72-79-86v118h-16V212c-25 14-57 44-79 86-6-14-9-30-9-48 0-66 36-126 88-158Z"
          fill="#1d3d2f"
        />
        <path
          d="M202 248c20 12 48 38 66 74-10 8-22 14-34 18-12-24-22-46-32-58-10 12-20 34-32 58-12-4-24-10-34-18 18-36 46-62 66-74Z"
          fill="#c4a35a"
        />
        <line
          x1="118"
          y1="168"
          x2="186"
          y2="148"
          stroke="#5d7a62"
          strokeWidth="1.2"
        />
        <line
          x1="186"
          y1="148"
          x2="268"
          y2="176"
          stroke="#5d7a62"
          strokeWidth="1.2"
        />
        <line
          x1="268"
          y1="176"
          x2="302"
          y2="248"
          stroke="#5d7a62"
          strokeWidth="1.2"
        />
        <line
          x1="186"
          y1="148"
          x2="214"
          y2="228"
          stroke="#c4a35a"
          strokeWidth="1.4"
        />
        {[
          [118, 168],
          [186, 148],
          [268, 176],
          [302, 248],
          [142, 236],
        ].map(([x, y], index) => (
          <g key={`${x}-${y}`}>
            {index === 1 ? (
              <circle
                cx={x}
                cy={y}
                r="14"
                fill="none"
                stroke="#c4a35a"
                strokeOpacity="0.55"
                className="signal-pulse origin-center"
                style={{ transformOrigin: `${x}px ${y}px` }}
              />
            ) : null}
            <circle cx={x} cy={y} r="5.5" fill="#fbfaf6" stroke="#1d3d2f" strokeWidth="2" />
          </g>
        ))}
        <circle cx="214" cy="228" r="7" fill="#9a4a32" />
        <text x="28" y="36" fill="#5d7a62" fontSize="11" fontFamily="ui-monospace, monospace">
          FIELD SIGNALS
        </text>
        <text x="300" y="36" fill="#8b6b4a" fontSize="11" fontFamily="ui-monospace, monospace">
          17.4N 78.5E
        </text>
      </svg>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-cream px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-sage">
          1 report
        </span>
        <span className="rounded-full bg-cream px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-leaf">
          Nearby signals
        </span>
        <span className="rounded-full bg-forest px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-cream">
          Pattern forming
        </span>
      </div>
    </div>
  );
}
