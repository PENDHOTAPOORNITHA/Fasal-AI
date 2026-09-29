import { Container } from "@/components/ui/Container";

export function FinalCta() {
  return (
    <section id="cta" className="scroll-mt-20 bg-forest">
      <Container className="py-20 text-center">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-harvest">
          Start here
        </p>
        <h2 className="mx-auto mt-4 max-w-2xl font-display text-4xl leading-tight text-cream sm:text-5xl">
          Better signals. Earlier action. Stronger harvests.
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-cream/75">
          Scan a crop when you are ready. Gemini analysis and live reporting
          arrive in a later build — this page is the product story.
        </p>
        <a
          href="#cta"
          className="mt-8 inline-flex rounded-full bg-cream px-6 py-3 text-sm font-medium text-forest transition-colors hover:bg-paper"
        >
          Start a Crop Scan
        </a>
      </Container>
    </section>
  );
}
