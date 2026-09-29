"use client";

import {
  ArrowRight,
  Camera,
  Mic,
  MessageSquare,
  ScanLine,
  CloudSun,
  Radar,
  BellRing,
  Sparkles,
  MapPin,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import FasalNavbar from "@/components/FasalNavbar";

export default function Home() {
  return (
    <main>
      <FasalNavbar />

      <section className="hero">
        <div className="hero-content">
          <div className="eyebrow">
            <span className="pulse"></span>
            Agricultural intelligence for India
          </div>

          <h1>
            Understand your crop.
            <span> See the bigger picture.</span>
          </h1>

          <p className="hero-description">
            Fasal AI helps farmers understand crop problems, connect local
            signals, and spot emerging agricultural risks before they spread.
          </p>

          <div className="hero-buttons">
            <Link
              href="/scan"
              className="primary-btn"
            >
              Scan a crop{" "}
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/farm-intelligence"
              className="secondary-btn"
            >
              Explore Threat Radar{" "}
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="hero-stats">
            <div>
              <strong>
                <Camera size={16} />
                Image
              </strong>

              <span>
                Show the problem
              </span>
            </div>

            <div>
              <strong>
                <Mic size={16} />
                Voice
              </strong>

              <span>
                Speak naturally
              </span>
            </div>

            <div>
              <strong>
                <MessageSquare size={16} />
                Local language
              </strong>

              <span>
                Understand clearly
              </span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="sun"></div>

          <div className="signal-ring ring-one"></div>
          <div className="signal-ring ring-two"></div>

          <div className="field field-back"></div>
          <div className="field field-middle"></div>
          <div className="field field-front"></div>

          <div className="floating-card scan-card">
            <div className="card-icon">
              <ScanLine size={20} />
            </div>

            <div>
              <small>
                AI CROP SCAN
              </small>

              <strong>
                Possible leaf stress detected
              </strong>
            </div>
          </div>

          <div className="floating-card signal-card">
            <div className="signal-dot"></div>

            <div>
              <small>
                LIVE SIGNAL
              </small>

              <strong>
                Similar reports increasing
              </strong>
            </div>
          </div>

          <div className="location-pin pin-one">
            <MapPin size={18} />
          </div>

          <div className="location-pin pin-two">
            <MapPin size={16} />
          </div>

          <div className="location-pin pin-three">
            <MapPin size={14} />
          </div>
        </div>
      </section>

      <section className="pattern-section">
        <div className="section-label">
          FROM ONE FARM TO COLLECTIVE INTELLIGENCE
        </div>

        <div className="pattern-flow">
          <div className="pattern-item">
            <div className="pattern-icon">
              <Camera size={26} />
            </div>

            <h3>
              One report
            </h3>

            <p>
              A farmer notices something unusual.
            </p>
          </div>

          <ChevronRight className="flow-arrow" />

          <div className="pattern-item">
            <div className="pattern-icon">
              <Sparkles size={26} />
            </div>

            <h3>
              Many signals
            </h3>

            <p>
              Similar reports become connected.
            </p>
          </div>

          <ChevronRight className="flow-arrow" />

          <div className="pattern-item">
            <div className="pattern-icon">
              <Radar size={26} />
            </div>

            <h3>
              Emerging pattern
            </h3>

            <p>
              The system detects unusual activity.
            </p>
          </div>

          <ChevronRight className="flow-arrow" />

          <div className="pattern-item highlight-pattern">
            <div className="pattern-icon">
              <BellRing size={26} />
            </div>

            <h3>
              Early warning
            </h3>

            <p>
              Communities can act earlier.
            </p>
          </div>
        </div>
      </section>

      <section
        className="how-section"
        id="how"
      >
        <div className="section-heading">
          <div className="section-label">
            HOW FASAL AI WORKS
          </div>

          <h2>
            From a simple observation
            <br />
            to meaningful action.
          </h2>

          <p>
            Every interaction has two purposes: helping the individual farmer
            today and strengthening agricultural intelligence for tomorrow.
          </p>
        </div>

        <div className="steps-grid">
          <article className="step-card">
            <span>01</span>

            <Camera size={30} />

            <h3>
              Report
            </h3>

            <p>
              Upload a crop image, speak, or describe what you see.
            </p>
          </article>

          <article className="step-card">
            <span>02</span>

            <ScanLine size={30} />

            <h3>
              Understand
            </h3>

            <p>
              AI analyzes symptoms, context and possible risks.
            </p>
          </article>

          <article className="step-card">
            <span>03</span>

            <MessageSquare size={30} />

            <h3>
              Connect
            </h3>

            <p>
              Your anonymized report becomes an agricultural signal.
            </p>
          </article>

          <article className="step-card">
            <span>04</span>

            <BellRing size={30} />

            <h3>
              Warn
            </h3>

            <p>
              Emerging patterns help communities act earlier.
            </p>
          </article>
        </div>
      </section>

      <section
        className="radar-section"
        id="radar"
      >
        <div className="radar-copy">
          <div className="section-label">
            THE EMERGING THREAT RADAR
          </div>

          <h2>
            Don&apos;t just identify the problem. See what it could become.
          </h2>

          <p>
            Fasal AI connects similar agricultural signals across locations
            and environmental conditions to identify unusual patterns early.
          </p>

          <div className="radar-points">
            <div>
              <span>01</span>

              <p>
                Similar crop signals appear across nearby districts.
              </p>
            </div>

            <div>
              <span>02</span>

              <p>
                Weather conditions increase the environmental risk.
              </p>
            </div>

            <div>
              <span>03</span>

              <p>
                An explainable alert is created for monitoring.
              </p>
            </div>
          </div>

          <Link
            href="/farm-intelligence"
            className="text-button"
          >
            See how alerts are explained{" "}
            <ArrowRight size={17} />
          </Link>
        </div>

        <div className="radar-visual">
          <div className="map-header">
            <div>
              <span>
                LIVE INTELLIGENCE
              </span>

              <h3>
                Emerging agricultural pattern
              </h3>
            </div>

            <div className="live-indicator">
              ● Monitoring
            </div>
          </div>

          <div className="abstract-map">
            <div className="map-blob blob-1"></div>
            <div className="map-blob blob-2"></div>
            <div className="map-blob blob-3"></div>

            <div className="radar-zone">
              <div className="zone-ring r1"></div>
              <div className="zone-ring r2"></div>
              <div className="zone-center"></div>
            </div>

            <div className="map-marker marker-a"></div>
            <div className="map-marker marker-b"></div>
            <div className="map-marker marker-c"></div>
            <div className="map-marker marker-d"></div>
          </div>

          <div className="threat-alert">
            <div>
              <small>
                EMERGING THREAT
              </small>

              <h4>
                Tomato leaf stress cluster
              </h4>

              <p>
                3 nearby districts · Trend increasing
              </p>
            </div>

            <div className="risk-score">
              <strong>
                78
              </strong>

              <span>
                Risk
              </span>
            </div>
          </div>
        </div>
      </section>

      <section
        className="feature-section"
        id="farmers"
      >
        <div className="section-heading centered">
          <div className="section-label">
            BUILT AROUND THE FARMER
          </div>

          <h2>
            Simple to use. Powerful underneath.
          </h2>
        </div>

        <div className="feature-grid">
          <div className="feature-card large-feature">
            <div className="feature-icon">
              <Camera size={28} />
            </div>

            <h3>
              AI Crop Scan
            </h3>

            <p>
              Show Fasal AI what you see. Get a clear, AI-assisted assessment.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Mic size={28} />
            </div>

            <h3>
              Speak your language
            </h3>

            <p>
              Report problems naturally in Telugu, Hindi or English.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <CloudSun size={28} />
            </div>

            <h3>
              Weather-aware risk
            </h3>

            <p>
              Understand how local conditions may influence your crop.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Radar size={28} />
            </div>

            <h3>
              Threat intelligence
            </h3>

            <p>
              Individual observations become a bigger agricultural picture.
            </p>
          </div>
        </div>
      </section>

      <section className="language-section">
        <div className="language-copy">
          <div className="section-label">
            SPEAK NATURALLY
          </div>

          <h2>
            Agricultural intelligence shouldn&apos;t require technical language.
          </h2>

          <p>
            Farmers can describe what they see in the language they are most
            comfortable with.
          </p>

          <div className="languages">
            <span>
              తెలుగు
            </span>

            <span>
              हिन्दी
            </span>

            <span>
              English
            </span>
          </div>
        </div>

        <div className="voice-demo">
          <div className="voice-top">
            <span className="voice-dot"></span>
            Farmer report
          </div>

          <p className="telugu-text">
            &quot;నా టమాటా ఆకుల మీద మచ్చలు వస్తున్నాయి.&quot;
          </p>

          <div className="voice-wave">
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
          </div>

          <div className="ai-response">
            <Sparkles size={17} />

            <p>
              AI is ready to understand and guide.
            </p>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="cta-glow"></div>

        <div className="section-label">
          FASAL AI
        </div>

        <h2>
          Better signals. Earlier action.
          <br />
          Stronger harvests.
        </h2>

        <p>
          Helping farmers understand today&apos;s problem while preparing
          communities for tomorrow&apos;s risks.
        </p>

        <Link
          href="/scan"
          className="primary-btn light-btn"
        >
          Start a crop scan{" "}
          <ArrowRight size={18} />
        </Link>
      </section>

      <footer>
        <div className="logo">
          <div className="logo-mark">
            ✦
          </div>

          <span>
            Fasal
            <span className="logo-ai">
              AI
            </span>
          </span>
        </div>

        <p>
          Built for the Build with AI Hackathon · 2026
        </p>

        <p>
          AI-powered agricultural intelligence
        </p>
      </footer>
    </main>
  );
}