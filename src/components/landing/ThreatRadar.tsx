"use client";

import { useState } from "react";
import { CloudRain, Layers3, MapPin, TrendingUp } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const reasons = [
  {
    icon: Layers3,
    label: "Similar symptoms",
    detail: "Tomato leaf spotting reported across multiple nearby farms.",
  },
  {
    icon: MapPin,
    label: "3 nearby districts",
    detail: "Signals cluster within a short regional radius, not a single village.",
  },
  {
    icon: CloudRain,
    label: "High humidity",
    detail: "Recent moisture conditions favor the same class of leaf stress.",
  },
  {
    icon: TrendingUp,
    label: "Trend increasing",
    detail: "Report volume in this window is above the usual local baseline.",
  },
];

export function ThreatRadar() {
  const [open, setOpen] = useState(false);

  return (
    <section id="radar" className="scroll-mt-20 border-b border-line">
      <Container className="py-20">
        <SectionHeading
          eyebrow="Emerging Threat Radar"
          title="When signals align, a region comes into view."
          description="This is Fasal’s core idea: not one diagnosis in isolation, but a pattern that forms across place, crop, time, and weather."
        />

        <div className="mt-12 grid items-stretch gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="overflow-hidden rounded-3xl border border-line bg-[#e7efe4] p-4 sm:p-6">
            <p className="mb-4 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-sage">
              India-inspired signal map · mock visual
            </p>
            <svg
              viewBox="0 0 360 420"
              className="h-auto w-full"
              role="img"
              aria-label="Abstract map of India with a tomato signal cluster in three districts"
            >
              <path
                d="M176 22c28 8 46 28 54 58 14 14 36 24 58 38 18 22 16 48 6 70 22 18 34 42 24 70-6 26-22 46-18 78-16 24-44 34-70 28-12 22-30 42-52 52-22-16-28-44-36-68-18 12-42 6-50-18-18-10-38-30-44-54-22-12-32-36-18-58-18-18-8-44 10-58-8-24 8-48 30-58 22-20 52-28 96-22Z"
                fill="#fbfaf6"
                stroke="#1d3d2f"
                strokeWidth="2"
              />
              <path
                d="M288 118c22-6 42 8 48 24-8 16-28 18-46 12-4-12-6-24-2-36Z"
                fill="#fbfaf6"
                stroke="#1d3d2f"
                strokeWidth="2"
              />
              <path
                d="M168 188 C 210 176, 248 210, 236 258"
                fill="none"
                stroke="#c4a35a"
                strokeWidth="1.6"
                strokeDasharray="4 5"
              />
              <path
                d="M168 188 C 150 230, 198 268, 236 258"
                fill="none"
                stroke="#c4a35a"
                strokeWidth="1.6"
                strokeDasharray="4 5"
              />
              {[
                [168, 188],
                [236, 258],
                [196, 228],
              ].map(([x, y]) => (
                <g key={`${x}-${y}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r="16"
                    fill="#c4a35a"
                    fillOpacity="0.18"
                    className="signal-pulse"
                    style={{ transformOrigin: `${x}px ${y}px` }}
                  />
                  <circle cx={x} cy={y} r="6" fill="#9a4a32" />
                </g>
              ))}
              <circle cx="118" cy="150" r="3.5" fill="#5d7a62" />
              <circle cx="210" cy="120" r="3.5" fill="#5d7a62" />
              <circle cx="250" cy="168" r="3.5" fill="#5d7a62" />
              <circle cx="140" cy="280" r="3.5" fill="#5d7a62" />
              <circle cx="200" cy="320" r="3.5" fill="#5d7a62" />
            </svg>
          </div>

          <div className="flex flex-col justify-center gap-5">
            <ol className="space-y-3 text-sm text-muted">
              <li className="rounded-xl border border-line bg-paper px-4 py-3">
                Tomato crop signals increasing
              </li>
              <li className="rounded-xl border border-line bg-paper px-4 py-3">
                3 nearby districts
              </li>
              <li className="rounded-xl border border-line bg-paper px-4 py-3">
                High humidity
              </li>
              <li className="rounded-xl border border-line bg-paper px-4 py-3">
                Similar leaf symptoms
              </li>
              <li className="rounded-xl border border-harvest/40 bg-harvest/15 px-4 py-3 font-medium text-forest">
                Emerging pattern detected
              </li>
            </ol>

            <article className="rounded-2xl border border-forest/15 bg-forest p-6 text-cream">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-harvest">
                Emerging threat
              </p>
              <h3 className="mt-3 font-display text-3xl">
                Tomato Leaf Stress Cluster
              </h3>
              <p className="mt-3 text-sm text-cream/80">Monitoring 3 districts</p>
              <p className="mt-1 text-sm text-harvest">Trend: Increasing</p>
              <button
                type="button"
                className="mt-6 rounded-full bg-cream px-4 py-2 text-sm font-medium text-forest"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
              >
                {open ? "Hide explanation" : "Why this alert?"}
              </button>
            </article>

            {open ? (
              <ul className="space-y-3 rounded-2xl border border-line bg-paper p-5">
                {reasons.map((reason) => (
                  <li key={reason.label} className="flex gap-3">
                    <reason.icon className="mt-0.5 h-4 w-4 shrink-0 text-leaf" />
                    <div>
                      <p className="text-sm font-medium text-forest">{reason.label}</p>
                      <p className="mt-1 text-sm text-muted">{reason.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
