import { Container } from "@/components/ui/Container";
import { HeroVisual } from "@/components/landing/HeroVisual";

export function Hero() {
  return (
    <section className="border-b border-line">
      <Container className="grid items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <div>
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-leaf">
            Fasal AI
          </p>
          <h1 className="mt-4 max-w-xl font-display text-4xl leading-[1.12] text-forest sm:text-5xl lg:text-[3.4rem]">
            One farm sees a problem. Fasal sees the pattern.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">
            AI-powered agricultural intelligence, built from the signals
            farmers see every day.
          </p>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-muted">
            A crop photo, a voice note, or a few words can become immediate
            guidance. Each anonymized report also joins a living network. When
            similar problems appear across nearby farms, Fasal detects the
            emerging threat earlier.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#cta"
              className="inline-flex items-center justify-center rounded-full bg-forest px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-leaf"
            >
              Scan a Crop
            </a>
            <a
              href="#radar"
              className="inline-flex items-center justify-center rounded-full border border-forest/20 bg-paper px-6 py-3 text-sm font-medium text-forest transition-colors hover:border-forest/40"
            >
              Explore Threat Radar
            </a>
          </div>
        </div>
        <HeroVisual />
      </Container>
    </section>
  );
}
