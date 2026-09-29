"use client";

import "./dashboard.css";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Filter,
  Map,
  MapPin,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wheat,
  X,
} from "lucide-react";

type Signal = {
  id: string;
  crop: string;
  state: string;
  district: string;
  description: string;
  issue: string;
  risk: string;
  confidence: string;
  language: string;
  createdAt: string | null;
};

type DistrictData = {
  district: string;
  count: number;
  risk: string;
  crops: string[];
  issues: string[];
};

const normalizeRisk = (
  risk: string
): "Low" | "Moderate" | "High" | "Critical" => {
  const value = String(risk || "")
    .trim()
    .toLowerCase();

  if (value.includes("critical")) {
    return "Critical";
  }

  if (value.includes("high")) {
    return "High";
  }

  if (
    value.includes("moderate") ||
    value.includes("medium")
  ) {
    return "Moderate";
  }

  if (value.includes("low")) {
    return "Low";
  }

  return "Moderate";
};

const getRiskScore = (risk: string): number => {
  const normalizedRisk = normalizeRisk(risk);

  if (normalizedRisk === "Critical") return 4;
  if (normalizedRisk === "High") return 3;
  if (normalizedRisk === "Moderate") return 2;

  return 1;
};

const getRiskClass = (risk: string): string => {
  return normalizeRisk(risk).toLowerCase();
};

const hotspotPositions = [
  { left: "14%", top: "18%" },
  { left: "48%", top: "17%" },
  { left: "80%", top: "19%" },

  { left: "28%", top: "43%" },
  { left: "61%", top: "42%" },
  { left: "84%", top: "44%" },

  { left: "15%", top: "68%" },
  { left: "48%", top: "66%" },
  { left: "77%", top: "68%" },

  { left: "29%", top: "86%" },
  { left: "60%", top: "85%" },
  { left: "84%", top: "84%" },
];

const getHotspotSize = (
  count: number,
  district: string
): number => {
  const countSize = Math.min(count * 5, 45);

  const nameSize =
    district.length > 14
      ? Math.min((district.length - 14) * 2, 20)
      : 0;

  return Math.max(
    72,
    Math.min(125, 72 + countSize + nameSize)
  );
};

export default function DashboardPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedState, setSelectedState] =
    useState("All");

  const [selectedCrop, setSelectedCrop] =
    useState("All");

  const [selectedRisk, setSelectedRisk] =
    useState("All");

  useEffect(() => {
    const loadSignals = async () => {
      try {
        const response = await fetch("/api/signals");

        if (!response.ok) {
          throw new Error(
            "Unable to load signals"
          );
        }

        const data = await response.json();

        const normalizedSignals: Signal[] = (
          data.signals || []
        ).map((signal: Partial<Signal>) => ({
          id: String(signal.id || ""),
          crop: String(signal.crop || ""),
          state: String(signal.state || ""),
          district: String(signal.district || ""),
          description: String(
            signal.description || ""
          ),
          issue: String(signal.issue || ""),
          risk: normalizeRisk(
            String(signal.risk || "Moderate")
          ),
          confidence: String(
            signal.confidence || ""
          ),
          language: String(
            signal.language || "English"
          ),
          createdAt:
            signal.createdAt || null,
        }));

        setSignals(normalizedSignals);
      } catch (error) {
        console.error(error);
        setSignals([]);
      } finally {
        setLoading(false);
      }
    };

    loadSignals();
  }, []);

  const states = useMemo<string[]>(() => {
    return Array.from(
      new Set(
        signals
          .map((signal) => signal.state)
          .filter(
            (state): state is string =>
              Boolean(state)
          )
      )
    ).sort();
  }, [signals]);

  const cropsList = useMemo<string[]>(() => {
    return Array.from(
      new Set(
        signals
          .map((signal) => signal.crop)
          .filter(
            (crop): crop is string =>
              Boolean(crop)
          )
      )
    ).sort();
  }, [signals]);

  const filteredSignals = useMemo(() => {
    return signals.filter((signal) => {
      const stateMatch =
        selectedState === "All" ||
        signal.state === selectedState;

      const cropMatch =
        selectedCrop === "All" ||
        signal.crop === selectedCrop;

      const riskMatch =
        selectedRisk === "All" ||
        signal.risk === selectedRisk;

      return (
        stateMatch &&
        cropMatch &&
        riskMatch
      );
    });
  }, [
    signals,
    selectedState,
    selectedCrop,
    selectedRisk,
  ]);

  /*
   * Only real districts are shown on the map.
   *
   * Signals without a district are still included
   * everywhere else in the dashboard, but they do
   * not create a fake "Not provided" hotspot.
   */
  const districtData = useMemo<
    DistrictData[]
  >(() => {
    const districtMap: Record<
      string,
      DistrictData
    > = {};

    filteredSignals.forEach((signal) => {
      const district = signal.district.trim();

      if (!district) {
        return;
      }

      const normalizedDistrict =
        district.toLowerCase();

      if (
        normalizedDistrict ===
          "not provided" ||
        normalizedDistrict ===
          "not provided district" ||
        normalizedDistrict ===
          "unknown" ||
        normalizedDistrict ===
          "unknown district" ||
        normalizedDistrict ===
          "n/a" ||
        normalizedDistrict ===
          "na"
      ) {
        return;
      }

      if (!districtMap[district]) {
        districtMap[district] = {
          district,
          count: 0,
          risk: normalizeRisk(
            signal.risk || "Moderate"
          ),
          crops: [],
          issues: [],
        };
      }

      districtMap[district].count += 1;

      if (
        getRiskScore(signal.risk) >
        getRiskScore(
          districtMap[district].risk
        )
      ) {
        districtMap[district].risk =
          normalizeRisk(
            signal.risk || "Moderate"
          );
      }

      const crop = signal.crop.trim();

      if (
        crop &&
        !districtMap[district].crops.includes(
          crop
        )
      ) {
        districtMap[district].crops.push(
          crop
        );
      }

      const issue = signal.issue.trim();

      if (
        issue &&
        !districtMap[district].issues.includes(
          issue
        )
      ) {
        districtMap[district].issues.push(
          issue
        );
      }
    });

    return Object.values(districtMap).sort(
      (a, b) => b.count - a.count
    );
  }, [filteredSignals]);

  const highRiskCount =
    filteredSignals.filter((signal) => {
      const risk = normalizeRisk(signal.risk);

      return (
        risk === "High" ||
        risk === "Critical"
      );
    }).length;

  const districts = useMemo(() => {
    return new Set(
      filteredSignals
        .map((signal) => signal.district)
        .filter(
          (district): district is string =>
            Boolean(district)
        )
    );
  }, [filteredSignals]);

  const crops = useMemo(() => {
    return new Set(
      filteredSignals
        .map((signal) => signal.crop)
        .filter(
          (crop): crop is string =>
            Boolean(crop)
        )
    );
  }, [filteredSignals]);

  const cropDistribution = useMemo(() => {
    const cropMap: Record<
      string,
      number
    > = {};

    filteredSignals.forEach((signal) => {
      const crop =
        signal.crop.trim() || "Other";

      cropMap[crop] =
        (cropMap[crop] || 0) + 1;
    });

    return Object.entries(cropMap)
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredSignals]);

  const riskDistribution = useMemo(() => {
    const risks = [
      "Low",
      "Moderate",
      "High",
      "Critical",
    ];

    return risks.map((risk) => ({
      risk,
      count: filteredSignals.filter(
        (signal) =>
          normalizeRisk(signal.risk) ===
          risk
      ).length,
    }));
  }, [filteredSignals]);

  const issueDistribution = useMemo(() => {
    const issueMap: Record<
      string,
      number
    > = {};

    filteredSignals.forEach((signal) => {
      const issue =
        signal.issue.trim() ||
        "Crop observation";

      issueMap[issue] =
        (issueMap[issue] || 0) + 1;
    });

    return Object.entries(issueMap)
      .map(([issue, count]) => ({
        issue,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredSignals]);

  const topDistrict =
    districtData.length > 0
      ? districtData[0]
      : null;

  const topCrop =
    cropDistribution.length > 0
      ? cropDistribution[0]
      : null;

  const topIssue =
    issueDistribution.length > 0
      ? issueDistribution[0]
      : null;

  const recentSignals =
    filteredSignals.slice(0, 6);

  const clearFilters = () => {
    setSelectedState("All");
    setSelectedCrop("All");
    setSelectedRisk("All");
  };

  if (loading) {
    return (
      <main className="dashboard-page loading-dashboard">
        <div className="dashboard-loader">
          <Sparkles size={26} />
          <span>
            Loading Fasal AI intelligence...
          </span>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <Link
          href="/"
          className="dashboard-back"
        >
          <span>←</span>
          Back to home
        </Link>

        <div className="dashboard-logo">
          <div>✦</div>

          <span>
            Fasal<span>AI</span>
          </span>
        </div>

        <Link
          href="/scan"
          className="dashboard-scan-button"
        >
          <Sparkles size={16} />
          New observation
        </Link>
      </header>

      <section className="dashboard-hero">
        <div>
          <div className="dashboard-eyebrow">
            <span></span>
            REGIONAL AGRICULTURAL INTELLIGENCE
          </div>

          <h1>
            See what&apos;s happening
            <em> beyond one farm.</em>
          </h1>

          <p>
            Fasal AI transforms crop
            observations into
            privacy-conscious regional
            signals, helping identify
            hotspots, repeated
            agricultural problems, and
            emerging patterns.
          </p>
        </div>

        <div className="live-status">
          <span></span>
          LIVE SIGNAL NETWORK
        </div>
      </section>

      <section className="dashboard-highlight-grid">
        <div className="highlight-card">
          <div className="highlight-icon">
            <MapPin size={20} />
          </div>

          <div>
            <span>Top activity</span>

            <strong>
              {topDistrict
                ? topDistrict.district
                : "No data"}
            </strong>

            <small>
              {topDistrict
                ? `${topDistrict.count} observations`
                : "Waiting for signals"}
            </small>
          </div>
        </div>

        <div className="highlight-card">
          <div className="highlight-icon">
            <Wheat size={20} />
          </div>

          <div>
            <span>Most reported crop</span>

            <strong>
              {topCrop
                ? topCrop.name
                : "No data"}
            </strong>

            <small>
              {topCrop
                ? `${topCrop.count} observations`
                : "Waiting for signals"}
            </small>
          </div>
        </div>

        <div className="highlight-card">
          <div className="highlight-icon warning-icon">
            <AlertTriangle size={20} />
          </div>

          <div>
            <span>Primary concern</span>

            <strong className="issue-highlight">
              {topIssue
                ? topIssue.issue
                : "No issue detected"}
            </strong>

            <small>
              {topIssue
                ? `${topIssue.count} matching observations`
                : "Waiting for signals"}
            </small>
          </div>
        </div>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Activity size={20} />
          </div>

          <div>
            <span>Total observations</span>
            <strong>
              {filteredSignals.length}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <MapPin size={20} />
          </div>

          <div>
            <span>Districts reporting</span>
            <strong>{districts.size}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={20} />
          </div>

          <div>
            <span>Crops monitored</span>
            <strong>{crops.size}</strong>
          </div>
        </div>

        <div className="stat-card danger-stat">
          <div className="stat-icon">
            <AlertTriangle size={20} />
          </div>

          <div>
            <span>High-risk signals</span>
            <strong>{highRiskCount}</strong>
          </div>
        </div>
      </section>

      <section className="filter-panel">
        <div className="filter-title">
          <Filter size={18} />

          <div>
            <strong>
              Explore the signal network
            </strong>

            <span>
              Filter observations by
              region, crop, or risk level.
            </span>
          </div>
        </div>

        <div className="filter-controls">
          <select
            value={selectedState}
            onChange={(event) =>
              setSelectedState(
                event.target.value
              )
            }
          >
            <option value="All">
              All states
            </option>

            {states.map((state) => (
              <option
                key={state}
                value={state}
              >
                {state}
              </option>
            ))}
          </select>

          <select
            value={selectedCrop}
            onChange={(event) =>
              setSelectedCrop(
                event.target.value
              )
            }
          >
            <option value="All">
              All crops
            </option>

            {cropsList.map((crop) => (
              <option
                key={crop}
                value={crop}
              >
                {crop}
              </option>
            ))}
          </select>

          <select
            value={selectedRisk}
            onChange={(event) =>
              setSelectedRisk(
                event.target.value
              )
            }
          >
            <option value="All">
              All risk levels
            </option>

            <option value="Low">
              Low
            </option>

            <option value="Moderate">
              Moderate
            </option>

            <option value="High">
              High
            </option>

            <option value="Critical">
              Critical
            </option>
          </select>

          <button
            type="button"
            onClick={clearFilters}
          >
            <X size={15} />
            Clear
          </button>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="map-panel">
          <div className="panel-heading">
            <div>
              <span>
                REGIONAL SIGNAL MAP
              </span>

              <h2>
                Agricultural hotspots
              </h2>
            </div>

            <Map size={21} />
          </div>

          <div className="signal-map">
            <div className="map-grid-lines"></div>

            <div className="map-label map-label-one">
              NORTH
            </div>

            <div className="map-label map-label-two">
              SOUTH
            </div>

            {districtData.length === 0 ? (
              <div className="empty-map">
                <MapPin size={30} />

                <strong>
                  No matching district signals
                </strong>

                <span>
                  Try changing your filters
                  or submit a new
                  observation.
                </span>
              </div>
            ) : (
              <div className="hotspot-container">
                {districtData.map(
                  (item, index) => {
                    const size =
                      getHotspotSize(
                        item.count,
                        item.district
                      );

                    const position =
                      hotspotPositions[
                        index %
                          hotspotPositions.length
                      ];

                    return (
                      <div
                        key={item.district}
                        className={`map-hotspot hotspot-${getRiskClass(
                          item.risk
                        )}`}
                        style={{
                          width: `${size}px`,
                          height: `${size}px`,
                          left: position.left,
                          top: position.top,
                        }}
                      >
                        <span className="hotspot-pulse"></span>

                        <strong>
                          {item.count}
                        </strong>

                        <small>
                          {item.district}
                        </small>

                        <div className="hotspot-tooltip">
                          <strong>
                            {item.district}
                          </strong>

                          <span>
                            {item.count} observations
                          </span>

                          <span>
                            Risk: {normalizeRisk(
                              item.risk
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>

          <div className="map-legend">
            <span>
              <i className="low-dot"></i>
              Low activity
            </span>

            <span>
              <i className="moderate-dot"></i>
              Emerging pattern
            </span>

            <span>
              <i className="high-dot"></i>
              High priority
            </span>
          </div>
        </div>

        <div className="insight-panel">
          <div className="panel-heading">
            <div>
              <span>
                AI SIGNAL SUMMARY
              </span>

              <h2>
                What needs attention?
              </h2>
            </div>

            <Sparkles size={20} />
          </div>

          {filteredSignals.length === 0 ? (
            <div className="empty-insight">
              <BarChart3 size={35} />

              <strong>
                Intelligence will appear
                here
              </strong>

              <p>
                As observations enter the
                network, Fasal AI will
                identify repeated issues
                and regional activity.
              </p>
            </div>
          ) : (
            <div className="insight-content">
              <div className="priority-insight">
                <div>
                  <Bell size={20} />
                </div>

                <div>
                  <span>
                    NETWORK STATUS
                  </span>

                  <strong>
                    {highRiskCount > 0
                      ? `${highRiskCount} observations require closer attention`
                      : "No high-priority regional alerts right now"}
                  </strong>
                </div>
              </div>

              <div className="ai-summary-box">
                <span>
                  FASAL AI INSIGHT
                </span>

                <p>
                  {topDistrict
                    ? `${topDistrict.district} currently shows the highest concentration of reported observations with ${topDistrict.count} signals.`
                    : "Not enough data to identify a regional pattern yet."}

                  {topCrop
                    ? ` ${topCrop.name} is currently the most frequently reported crop.`
                    : ""}

                  {topIssue
                    ? ` The most common reported concern is ${topIssue.issue.toLowerCase()}.`
                    : ""}
                </p>
              </div>

              <div className="district-ranking">
                {districtData
                  .slice(0, 5)
                  .map(
                    (item, index) => (
                      <div
                        className="district-row"
                        key={item.district}
                      >
                        <span className="rank">
                          {index + 1}
                        </span>

                        <div>
                          <strong>
                            {item.district}
                          </strong>

                          <small>
                            {item.count} recorded
                            observation
                            {item.count !== 1
                              ? "s"
                              : ""}
                          </small>
                        </div>

                        <span
                          className={`risk-badge ${getRiskClass(
                            item.risk
                          )}`}
                        >
                          {normalizeRisk(
                            item.risk
                          )}
                        </span>
                      </div>
                    )
                  )}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="analytics-grid">
        <div className="analytics-panel">
          <div className="panel-heading">
            <div>
              <span>
                CROP DISTRIBUTION
              </span>

              <h2>
                What is being monitored?
              </h2>
            </div>

            <Wheat size={20} />
          </div>

          <div className="distribution-list">
            {cropDistribution.length === 0 ? (
              <div className="simple-empty">
                No crop data available.
              </div>
            ) : (
              cropDistribution.map(
                (item) => {
                  const percentage =
                    filteredSignals.length > 0
                      ? Math.round(
                          (item.count /
                            filteredSignals.length) *
                            100
                        )
                      : 0;

                  return (
                    <div
                      className="distribution-row"
                      key={item.name}
                    >
                      <div className="distribution-label">
                        <span>
                          {item.name}
                        </span>

                        <strong>
                          {item.count}
                        </strong>
                      </div>

                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${percentage}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                }
              )
            )}
          </div>
        </div>

        <div className="analytics-panel">
          <div className="panel-heading">
            <div>
              <span>
                RISK DISTRIBUTION
              </span>

              <h2>
                Current network health
              </h2>
            </div>

            <AlertTriangle size={20} />
          </div>

          <div className="risk-chart">
            {riskDistribution.map(
              (item) => {
                const percentage =
                  filteredSignals.length > 0
                    ? Math.max(
                        8,
                        (item.count /
                          filteredSignals.length) *
                          100
                      )
                    : 8;

                return (
                  <div
                    className="risk-column"
                    key={item.risk}
                  >
                    <div className="bar-wrapper">
                      <div
                        className={`risk-bar ${item.risk.toLowerCase()}`}
                        style={{
                          height: `${percentage}%`,
                        }}
                      >
                        {item.count > 0 && (
                          <span>
                            {item.count}
                          </span>
                        )}
                      </div>
                    </div>

                    <small>
                      {item.risk}
                    </small>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </section>

      <section className="recent-section">
        <div className="section-title">
          <div>
            <span>
              RECENT OBSERVATIONS
            </span>

            <h2>
              Latest signals entering the
              network
            </h2>
          </div>

          <ShieldCheck size={22} />
        </div>

        {recentSignals.length === 0 ? (
          <div className="empty-observations">
            No observations match the
            selected filters.
          </div>
        ) : (
          <div className="recent-grid">
            {recentSignals.map(
              (signal) => (
                <div
                  className="observation-card"
                  key={signal.id}
                >
                  <div className="observation-top">
                    <span className="crop-tag">
                      {signal.crop || "Crop"}
                    </span>

                    <span
                      className={`risk-badge ${getRiskClass(
                        signal.risk
                      )}`}
                    >
                      {normalizeRisk(
                        signal.risk ||
                          "Moderate"
                      )}
                    </span>
                  </div>

                  <h3>
                    {signal.issue ||
                      "Crop observation"}
                  </h3>

                  <p>
                    <MapPin size={14} />

                    {signal.district ||
                      "Unknown district"}

                    {signal.state
                      ? `, ${signal.state}`
                      : ""}
                  </p>

                  <small>
                    Confidence:{" "}
                    {signal.confidence ||
                      "N/A"}
                  </small>
                </div>
              )
            )}
          </div>
        )}
      </section>
    </main>
  );
}