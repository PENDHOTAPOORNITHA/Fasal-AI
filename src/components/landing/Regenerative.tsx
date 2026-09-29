import { Droplets, Leaf, Sprout, SunMedium } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const practices = [
  {
    icon: Sprout,
    title: "Soil health awareness",
    body: "Guidance that looks past the leaf — toward what the soil can sustain next season.",
  },
  {
    icon: SunMedium,
    title: "Climate-aware farming",
    body: "Advice shaped by local humidity, rainfall, and heat, not a one-size calendar.",
  },
  {
    icon: Droplets,
    title: "Water-conscious practices",
    body: "When leaf wetness is the risk, Fasal favors watering methods that protect the canopy.",
  },
  {
    icon: Leaf,
    title: "Regenerative recommendations",
    body: "Where it is safe, the plan prefers resilience over a reflex to spray.",
  },
];

export function Regenerative() {
  return (
    <section className="border-b border-line">
      <Container className="py-20">
        <SectionHeading
          eyebrow="Beyond the diagnosis"
          title="Identify the problem. Strengthen the farm."
          description="Fasal AI is not only an early-warning system. It also points toward soil, climate, water, and regenerative choices that make the next season less fragile."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {practices.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-line bg-[#eef3ea] p-6"
            >
              <item.icon className="h-5 w-5 text-leaf" />
              <h3 className="mt-4 font-display text-2xl text-forest">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
