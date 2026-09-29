"use client";

import { useState } from "react";
import { ArrowRight, ImageIcon, Mic, Type } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

const samples = {
  te: {
    label: "తెలుగు",
    langClass: "font-telugu",
    input: "నా టమాటా ఆకుల మీద మచ్చలు వస్తున్నాయి.",
    guidance: "ఆకులను ఆరబెట్టి, నీటిని ఆకుల మీద కాకుండా మొక్క అడుగున పెట్టండి. సమీపంలో ఇలాంటి సంకేతాలు పెరుగుతున్నాయి.",
  },
  hi: {
    label: "हिन्दी",
    langClass: "font-hindi",
    input: "मेरे टमाटर के पत्तों पर धब्बे आ रहे हैं।",
    guidance: "पत्तियों को सूखा रखें और पानी जड़ के पास दें। आस-पास मिलते-जुलते संकेत बढ़ रहे हैं।",
  },
  en: {
    label: "English",
    langClass: "",
    input: "Spots are appearing on my tomato leaves.",
    guidance: "Keep foliage dry and water at the base. Similar signals are rising nearby.",
  },
};

type Lang = keyof typeof samples;

export function Languages() {
  const [lang, setLang] = useState<Lang>("te");
  const sample = samples[lang];

  return (
    <section id="farmers" className="scroll-mt-20 border-b border-line bg-paper">
      <Container className="py-20">
        <SectionHeading
          eyebrow="In the farmer’s language"
          title="Voice, text, or image — understood locally."
          description="Fasal is designed for Telugu, Hindi, and English from the first conversation, not as an afterthought."
        />

        <div className="mt-8 flex flex-wrap gap-2">
          {(Object.keys(samples) as Lang[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setLang(key)}
              className={cn(
                "rounded-full px-4 py-2 text-sm",
                lang === key
                  ? "bg-forest text-cream"
                  : "border border-line bg-cream text-forest",
                samples[key].langClass,
              )}
            >
              {samples[key].label}
            </button>
          ))}
        </div>

        <p
          className={cn(
            "mt-8 max-w-3xl font-display text-2xl leading-snug text-forest sm:text-3xl",
            sample.langClass,
          )}
        >
          “{sample.input}”
        </p>

        <div className="mt-12 grid items-center gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          <div className="rounded-2xl border border-line bg-cream p-5">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-sage">
              Farmer input
            </p>
            <div className="mt-4 flex gap-3 text-leaf">
              <Mic className="h-5 w-5" />
              <Type className="h-5 w-5" />
              <ImageIcon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm text-muted">Voice / Text / Image</p>
          </div>
          <ArrowRight className="mx-auto hidden h-5 w-5 text-sage md:block" />
          <div className="rounded-2xl border border-line bg-cream p-5">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-sage">
              AI understanding
            </p>
            <p className="mt-4 text-sm leading-relaxed text-forest">
              Symptoms, crop, and likely stress — structured, not just a paragraph.
            </p>
          </div>
          <ArrowRight className="mx-auto hidden h-5 w-5 text-sage md:block" />
          <div className="rounded-2xl border border-forest bg-forest p-5 text-cream">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-harvest">
              Local guidance
            </p>
            <p className={cn("mt-4 text-sm leading-relaxed", sample.langClass)}>
              {sample.guidance}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
