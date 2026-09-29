"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Activity,
  AlertTriangle,
  MapPin,
  Radar,
  Sprout,
} from "lucide-react";
import { useEffect, useState } from "react";
import "./radar.css";

type Hotspot = {
  district: string;
  state: string;
  count: number;
  level: string;
  score: number;
  crops: string[];
  issues: string[];
};

type RadarData = {
  hotspots: Hotspot[];
  totalSignals: number;
  totalDistricts: number;
};

export default function RadarPage() {
  const [data, setData] =
    useState<RadarData | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadRadar() {
      try {
        const response = await fetch(
          "/api/radar",
          {
            cache: "no-store",
          }
        );

        const result =
          await response.json();

        if (result.success) {
          setData(result);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadRadar();
  }, []);

  return (
    <main className="radar-page">
      <header className="radar-topbar">
        <Link href="/" className="radar-back">
          <ArrowLeft size={17} />
          Back to home
        </Link>

        <div className="radar-logo">
          ✦ Fasal<span>AI</span>
        </div>

        <div className="radar-live">
          <span />
          LIVE SIGNALS
        </div>
      </header>

      <section className="radar-hero">
        <div>
          <span className="radar-label">
            <Radar size={15} />
            AGRICULTURAL INTELLIGENCE
          </span>

          <h1>
            Regional
            <em> Crop Radar</em>
          </h1>

          <p>
            Privacy-protected agricultural
            observations are analyzed to identify
            emerging crop patterns and regional
            risks.
          </p>
        </div>

        <div className="radar-stats">
          <div>
            <Activity size={19} />
            <strong>
              {data?.totalSignals || 0}
            </strong>
            <span>Recent signals</span>
          </div>

          <div>
            <MapPin size={19} />
            <strong>
              {data?.totalDistricts || 0}
            </strong>
            <span>Districts monitored</span>
          </div>
        </div>
      </section>

      <section className="hotspots-section">
        <div className="section-top">
          <div>
            <span>LIVE REGIONAL ANALYSIS</span>
            <h2>Detected agricultural hotspots</h2>
          </div>
        </div>

        {loading ? (
          <div className="radar-loading">
            Analyzing recent agricultural signals...
          </div>
        ) : !data?.hotspots.length ? (
          <div className="radar-empty">
            <Sprout size={36} />
            <h3>No regional hotspots yet</h3>
            <p>
              As more observations are submitted,
              Fasal AI will identify emerging
              agricultural patterns.
            </p>
          </div>
        ) : (
          <div className="hotspot-grid">
            {data.hotspots.map(
              (hotspot, index) => (
                <div
                  className="hotspot-card"
                  key={`${hotspot.district}-${index}`}
                >
                  <div className="hotspot-head">
                    <div>
                      <span className="hotspot-number">
                        0{index + 1}
                      </span>

                      <h3>
                        {hotspot.district}
                      </h3>

                      <p>
                        {hotspot.state}
                      </p>
                    </div>

                    <div
                      className={`hotspot-risk hotspot-${hotspot.level.toLowerCase()}`}
                    >
                      <AlertTriangle size={15} />
                      {hotspot.level}
                    </div>
                  </div>

                  <div className="hotspot-metric">
                    <strong>
                      {hotspot.count}
                    </strong>

                    <span>
                      recent agricultural signals
                    </span>
                  </div>

                  <div className="hotspot-details">
                    <span>CROPS</span>

                    <p>
                      {hotspot.crops
                        .slice(0, 3)
                        .join(", ") || "Not available"}
                    </p>

                    <span>OBSERVED PATTERNS</span>

                    <p>
                      {hotspot.issues
                        .slice(0, 2)
                        .join(", ") ||
                        "Under observation"}
                    </p>
                  </div>

                  <div className="hotspot-score">
                    <span>RADAR SCORE</span>

                    <strong>
                      {hotspot.score}
                    </strong>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>
    </main>
  );
}