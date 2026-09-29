import {
  ImageIcon,
  Mic,
  ScanSearch,
  Share2,
  ShieldAlert,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const steps = [
  {
    n: "01",
    title: "Report",
    body: "Upload a crop image, speak, or describe the problem in your own words.",
    icons: [ImageIcon, Mic],
  },
  {
    n: "02",
    title: "Understand",
    body: "Gemini AI analyzes symptoms, context, and possible risks — then returns guidance you can act on.",
    icons: [ScanSearch],
  },
  {
    n: "03",
    title: "Connect",
    body: "The anonymized report becomes a signal in a living agricultural network.",
    icons: [Share2],
  },
  {
    n: "04",
    title: "Warn",
    body: "Fasal detects emerging patterns and helps communities act earlier.",
    icons: [ShieldAlert],
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-b border-line">
      <Container className="py-20">
        <SectionHeading
          eyebrow="How Fasal AI works"
          title="From a single crop scan to collective early warning."
          description="Intelligence is not a chatbot. It is a path: perceive, explain, connect, and detect."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <article
              key={step.n}
              className="relative rounded-2xl border border-line bg-paper p-6"
            >
              {index < steps.length - 1 ? (
                <span
                  className="pointer-events-none absolute top-10 right-[-13px] hidden h-px w-[26px] bg-line lg:block"
                  aria-hidden="true"
                />
              ) : null}
              <div className="flex items-center justify-between">
                <span className="font-mono text-[0.65rem] text-sage">{step.n}</span>
                <span className="flex gap-1.5 text-leaf">
                  {step.icons.map((Icon, iconIndex) => (
                    <Icon key={iconIndex} className="h-4 w-4" />
                  ))}
                </span>
              </div>
              <h3 className="mt-8 font-display text-2xl text-forest">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{step.body}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
