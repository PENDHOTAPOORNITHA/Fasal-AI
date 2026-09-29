import { Wordmark } from "@/components/brand/Wordmark";
import { Container } from "@/components/ui/Container";

const placeholders = ["Privacy", "Contact", "GitHub"];

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper">
      <Container className="flex flex-col gap-8 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Wordmark />
          <p className="mt-3 max-w-sm text-sm text-muted">
            Built for the Build with AI Hackathon.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-6">
          {placeholders.map((label) => (
            <span key={label} className="text-sm text-muted">
              {label}
            </span>
          ))}
        </nav>
      </Container>
    </footer>
  );
}
