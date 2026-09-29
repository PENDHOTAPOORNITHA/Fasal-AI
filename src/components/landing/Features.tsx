import {
  AudioLines,
  CloudSun,
  Info,
  Radar,
  ScanLine,
  Users,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "AI Crop Scan",
    body: "Photograph a leaf or field. Gemini reads symptoms, crop context, and likely causes — not as a chat, as an assessment.",
    icon: ScanLine,
    visual: "scan",
    tone: "bg-[#e7efe4]",
  },
  {
    title: "Voice in Your Language",
    body: "Speak in Telugu, Hindi, or English. Fasal is built for how farmers actually describe a problem.",
    icon: AudioLines,
    visual: "voice",
    tone: "bg-[#f3eee4]",
  },
  {
    title: "Weather-Aware Risk",
    body: "Humidity, rainfall, and heat sit next to the diagnosis, so advice reflects the field — not a generic pamphlet.",
    icon: CloudSun,
    visual: "weather",
    tone: "bg-[#e8f0ee]",
  },
  {
    title: "Emerging Threat Radar",
    body: "Similar signals across nearby districts can surface a cluster before it is obvious on the ground.",
    icon: Radar,
    visual: "radar",
    tone: "bg-[#efe8dc]",
  },
  {
    title: "Community Early Alerts",
    body: "When a pattern forms, nearby farmers see a district-level warning — never another farmer’s name or home.",
    icon: Users,
    visual: "alerts",
    tone: "bg-[#f1ebe3]",
  },
  {
    title: "Explainable AI",
    body: "Every alert can answer “why”: report count, similarity, weather, and confidence — in plain language.",
    icon: Info,
    visual: "explain",
    tone: "bg-[#ecefe4]",
  },
];

function CardVisual({ kind }: { kind: string }) {
  if (kind === "scan") {
    return (
      <svg viewBox="0 0 120 56" className="h-14 w-full" aria-hidden="true">
        <rect x="34" y="6" width="52" height="44" rx="4" fill="none" stroke="#1d3d2f" strokeWidth="1.4" />
        <path d="M50 36c8-14 18-20 26-22-2 10-4 22-10 28-6-2-12-2-16-6Z" fill="#2f5d3a" />
        <path d="M34 18h52" stroke="#c4a35a" strokeWidth="1.2" />
      </svg>
    );
  }
  if (kind === "voice") {
    return (
      <svg viewBox="0 0 120 56" className="h-14 w-full" aria-hidden="true">
        {[10, 18, 26, 22, 32, 16, 24, 12].map((h, i) => (
          <rect
            key={i}
            x={22 + i * 12}
            y={28 - h / 2}
            width="5"
            height={h}
            rx="2"
            fill={i === 4 ? "#1d3d2f" : "#5d7a62"}
          />
        ))}
      </svg>
    );
  }
  if (kind === "weather") {
    return (
      <svg viewBox="0 0 120 56" className="h-14 w-full" aria-hidden="true">
        <circle cx="28" cy="22" r="8" fill="#c4a35a" />
        <path d="M48 28h52" stroke="#2f5d3a" strokeOpacity="0.25" />
        <path d="M48 36h40" stroke="#2f5d3a" strokeOpacity="0.45" />
        <path d="M48 44h28" stroke="#2f5d3a" />
      </svg>
    );
  }
  if (kind === "radar") {
    return (
      <svg viewBox="0 0 120 56" className="h-14 w-full" aria-hidden="true">
        <circle cx="60" cy="28" r="20" fill="none" stroke="#2f5d3a" strokeOpacity="0.2" />
        <circle cx="60" cy="28" r="12" fill="none" stroke="#2f5d3a" strokeOpacity="0.4" />
        <circle cx="60" cy="28" r="4" fill="#9a4a32" />
        <circle cx="74" cy="18" r="3" fill="#1d3d2f" />
      </svg>
    );
  }
  if (kind === "alerts") {
    return (
      <svg viewBox="0 0 120 56" className="h-14 w-full" aria-hidden="true">
        <rect x="24" y="14" width="72" height="12" rx="3" fill="#dfe8db" />
        <rect x="24" y="30" width="56" height="12" rx="3" fill="#1d3d2f" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 120 56" className="h-14 w-full" aria-hidden="true">
      <circle cx="30" cy="28" r="10" fill="#2f5d3a" />
      <path d="M48 28h40" stroke="#8b6b4a" strokeWidth="1.4" />
      <circle cx="96" cy="28" r="8" fill="none" stroke="#c4a35a" strokeWidth="2" />
    </svg>
  );
}

export function Features() {
  return (
    <section className="border-b border-line bg-paper">
      <Container className="py-20">
        <SectionHeading
          eyebrow="What Fasal gives you"
          title="Guidance for one farmer. Intelligence for a region."
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="flex flex-col overflow-hidden rounded-2xl border border-line bg-cream"
            >
              <div className={cn("px-5 pt-5", feature.tone)}>
                <CardVisual kind={feature.visual} />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <feature.icon className="h-4 w-4 text-leaf" aria-hidden="true" />
                <h3 className="mt-3 font-display text-2xl text-forest">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {feature.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
