import { ArrowDown } from "lucide-react";
import { Container } from "@/components/ui/Container";

const stages = [
  {
    title: "One report",
    body: "A farmer notices something on a leaf, in a field, or in the weather around them.",
  },
  {
    title: "Many signals",
    body: "Nearby farms submit similar symptoms, crops, and conditions — without sharing identity.",
  },
  {
    title: "Emerging pattern",
    body: "Location, time, and environment line up. Isolated issues start to look connected.",
  },
  {
    title: "Early warning",
    body: "Communities get a chance to act before a local problem becomes a regional loss.",
  },
];

export function SignalFlow() {
  return (
    <section className="border-b border-line bg-paper">
      <Container className="py-20">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-leaf">
          From one field to a region
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl leading-tight text-forest sm:text-4xl">
          A farmer may see a problem alone. Together, those reports can reveal
          something much bigger.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          One farmer sees a problem. Many farmers reveal a pattern.
        </p>

        <ol className="mt-14 grid gap-0 md:grid-cols-4">
          {stages.map((stage, index) => (
            <li key={stage.title} className="relative flex flex-col">
              <div className="flex flex-1 flex-col border border-line bg-cream p-6 md:border-l-0 md:first:border-l">
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-harvest">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-display text-2xl text-forest">
                  {stage.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {stage.body}
                </p>
              </div>
              {index < stages.length - 1 ? (
                <ArrowDown
                  className="mx-auto my-2 h-4 w-4 text-sage md:hidden"
                  aria-hidden="true"
                />
              ) : null}
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
