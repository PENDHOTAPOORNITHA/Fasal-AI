"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Leaf,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import "./results.css";

type Analysis = {
  issue: string;
  confidence: string;
  risk: string;
  explanation: string;
  actions: string[];
  avoid: string[];
  prevention: string;
  local_context: string;
};

type ScanData = {
  crop: string;
  state: string;
  district: string;
  language: string;
  image: string | null;
  analysis: Analysis;

  similarSignalCount?: number;
  clusterLevel?: string;
  clusterMessage?: string;
  affectedDistricts?: string[];
  districtCount?: number;
  regionalSignalCount?: number;
};

export default function ResultsPage() {
  const [data, setData] = useState<ScanData | null>(null);
  const [signalLoading, setSignalLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("fasal-analysis");

      if (!saved) {
        setSignalLoading(false);
        return;
      }

      setData(JSON.parse(saved));
    } catch (error) {
      console.error("Error loading analysis:", error);
    } finally {
      setSignalLoading(false);
    }
  }, []);

  if (!data) {
    return (
      <main className="results-page">
        <div className="empty-results">
          <Sparkles size={35} />

          <h1>No analysis found</h1>

          <p>
            Start a crop scan to receive your Fasal AI assessment.
          </p>

          <Link href="/scan" className="results-primary">
            Start a scan
            <ArrowRight size={17} />
          </Link>
        </div>
      </main>
    );
  }

  const risk = data.analysis?.risk || "Moderate";

  const riskClass =
    risk.toLowerCase() === "low"
      ? "risk-low"
      : risk.toLowerCase() === "moderate"
      ? "risk-moderate"
      : "risk-high";

  const confidenceNumber =
    parseInt(data.analysis?.confidence || "0", 10) || 0;

  const clusterLevel = data.clusterLevel || "None";

  const hasRegionalSignal =
    (data.regionalSignalCount || 0) > 0;

  return (
    <main className="results-page">
      {/* TOP BAR */}
      <header className="results-topbar">
        <Link href="/scan" className="results-back">
          <ArrowLeft size={17} />
          New scan
        </Link>

        <div className="results-logo">
          <span className="results-logo-mark">✦</span>
          Fasal<span>AI</span>
        </div>

        <div className="results-status">
          <span />
          AI ASSESSMENT
        </div>
      </header>

      {/* HEADER */}
      <section className="results-header">
        <div className="results-eyebrow">
          <Sparkles size={14} />
          ANALYSIS COMPLETE
        </div>

        <h1>
          Here's what we found
          <em> in your crop.</em>
        </h1>

        <p>
          Fasal AI combines your crop observation with the
          information you provided to generate a practical
          assessment and next steps.
        </p>
      </section>

      <section className="results-grid">
        <div className="results-main">

          {/* MAIN SUMMARY */}
          <div className="result-summary">
            <div className="result-summary-top">
              <div>
                <span className="result-label">
                  LIKELY ISSUE
                </span>

                <h2>
                  {data.analysis.issue}
                </h2>
              </div>

              <div className={`risk-badge ${riskClass}`}>
                <TriangleAlert size={16} />
                {risk} risk
              </div>
            </div>

            <div className="confidence">
              <div className="confidence-heading">
                <span>AI confidence</span>

                <strong>
                  {data.analysis.confidence}
                </strong>
              </div>

              <div className="confidence-bar">
                <div
                  style={{
                    width: `${Math.min(
                      Math.max(confidenceNumber, 5),
                      100
                    )}%`,
                  }}
                />
              </div>

              <small>
                Confidence reflects the AI's assessment of
                the available information. It is not a
                laboratory-confirmed diagnosis.
              </small>
            </div>
          </div>

          {/* PHOTO */}
          {data.image && (
            <div className="result-photo">
              <img
                src={data.image}
                alt="Crop submitted for analysis"
              />

              <div>
                <Check size={15} />
                Photo used for assessment
              </div>
            </div>
          )}

          {/* EXPLANATION */}
          <div className="result-card">
            <div className="result-card-heading">
              <div className="result-card-icon">
                <Sparkles size={19} />
              </div>

              <div>
                <span>AI EXPLANATION</span>
                <h3>What may be happening</h3>
              </div>
            </div>

            <p className="explanation">
              {data.analysis.explanation}
            </p>
          </div>

          {/* ACTIONS */}
          <div className="result-card action-card">
            <div className="result-card-heading">
              <div className="result-card-icon">
                <Leaf size={19} />
              </div>

              <div>
                <span>RECOMMENDED ACTIONS</span>
                <h3>What you can do now</h3>
              </div>
            </div>

            <div className="action-list">
              {data.analysis.actions?.map(
                (action, index) => (
                  <div
                    className="action-item"
                    key={index}
                  >
                    <span>{index + 1}</span>
                    <p>{action}</p>
                  </div>
                )
              )}
            </div>
          </div>

          {/* AVOID */}
          {data.analysis.avoid?.length > 0 && (
            <div className="result-card avoid-card">
              <div className="result-card-heading">
                <div className="result-card-icon">
                  <ShieldCheck size={19} />
                </div>

                <div>
                  <span>BE CAREFUL</span>
                  <h3>Things to avoid</h3>
                </div>
              </div>

              <div className="avoid-list">
                {data.analysis.avoid.map(
                  (item, index) => (
                    <p key={index}>
                      • {item}
                    </p>
                  )
                )}
              </div>
            </div>
          )}

          {/* PREVENTION */}
          <div className="result-card">
            <div className="result-card-heading">
              <div className="result-card-icon">
                <Leaf size={19} />
              </div>

              <div>
                <span>PREVENTION</span>

                <h3>
                  Protect your crop going forward
                </h3>
              </div>
            </div>

            <p className="explanation">
              {data.analysis.prevention}
            </p>
          </div>

          {/* AI LIMITATION */}
          <div className="assessment-note">
            <ShieldCheck size={18} />

            <div>
              <strong>
                AI-assisted assessment
              </strong>

              <p>
                Fasal AI provides decision support, not a
                confirmed field diagnosis. Check symptoms
                across multiple plants and consult a local
                agricultural expert before major treatment
                decisions.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <aside className="results-side">

          {/* OBSERVATION */}
          <div className="field-card">
            <span className="result-label">
              YOUR OBSERVATION
            </span>

            <div className="field-crop">
              <span className="field-crop-icon">
                🌱
              </span>

              <div>
                <strong>{data.crop}</strong>
                <span>Crop</span>
              </div>
            </div>

            <div className="field-detail">
              <span>Location</span>

              <strong>
                {data.district ||
                  "District not provided"}

                {data.state
                  ? `, ${data.state}`
                  : ""}
              </strong>
            </div>

            <div className="field-detail">
              <span>Response language</span>

              <strong>
                {data.language || "English"}
              </strong>
            </div>
          </div>

          {/* LOCAL CONTEXT */}
          <div className="local-card">
            <div className="local-icon">
              <Leaf size={19} />
            </div>

            <span>LOCAL CONTEXT</span>

            <p>
              {data.analysis.local_context}
            </p>
          </div>

          {/* SIGNAL NETWORK */}
          <div className="signal-card">
            <div className="signal-top">
              <span className="signal-live" />
              FASAL SIGNAL NETWORK
            </div>

            {signalLoading ? (
              <>
                <h3>
                  Checking regional signals...
                </h3>

                <p>
                  Fasal AI is comparing this observation
                  with privacy-protected agricultural signals.
                </p>
              </>
            ) : hasRegionalSignal ? (
              <>
                <div className="signal-count">
                  <strong>
                    {data.regionalSignalCount}
                  </strong>

                  <span>
                    similar observations
                  </span>
                </div>

                <h3>
                  Regional pattern detected
                </h3>

                <p>
                  {data.clusterMessage ||
                    `Similar ${data.crop} observations have
                    been detected in the regional signal network.`}
                </p>

                <div className="cluster-alert">
                  <TriangleAlert size={16} />

                  <span>
                    {clusterLevel === "High"
                      ? "Strong regional pattern. Farmers should monitor their crops closely."
                      : clusterLevel === "Moderate"
                      ? "Emerging regional pattern. Continue monitoring your crop."
                      : "Early regional signal detected. Continued monitoring is recommended."}
                  </span>
                </div>

                {data.districtCount &&
                  data.districtCount > 1 && (
                    <div className="cluster-regions">
                      <span>
                        REGIONS AFFECTED
                      </span>

                      <strong>
                        {data.districtCount} districts
                      </strong>

                      {data.affectedDistricts &&
                        data.affectedDistricts.length > 0 && (
                          <div className="region-tags">
                            {data.affectedDistricts.map(
                              (district) => (
                                <span
                                  className="region-tag"
                                  key={district}
                                >
                                  {district}
                                </span>
                              )
                            )}
                          </div>
                        )}
                    </div>
                  )}
              </>
            ) : (
              <>
                <h3>
                  No significant regional pattern
                </h3>

                <p>
                  This observation is being monitored.
                  As more privacy-protected observations
                  arrive, Fasal AI can identify emerging
                  agricultural patterns.
                </p>
              </>
            )}
          </div>

          {/* NEXT STEP */}
          <div className="results-next-card">
            <span>NEXT STEP</span>

            <h3>
              Want help deciding what to do?
            </h3>

            <p>
              Ask Fasal AI about irrigation, pests,
              disease management, weather or your crop.
            </p>

            <Link href="/assistant">
              <MessageCircle size={17} />
              Ask Fasal AI
              <ArrowRight size={16} />
            </Link>
          </div>
        </aside>
      </section>

      {/* BOTTOM */}
      <section className="results-bottom">
        <Link
          href="/scan"
          className="results-primary"
        >
          <Sparkles size={17} />
          Scan another crop
          <ArrowRight size={17} />
        </Link>

        <Link
          href="/my-farm"
          className="results-secondary"
        >
          My Farm
        </Link>

        <Link
          href="/farm-intelligence"
          className="results-secondary"
        >
          Farm Intelligence
        </Link>
      </section>
    </main>
  );
}