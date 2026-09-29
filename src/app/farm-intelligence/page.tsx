"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import FasalNavbar from "@/components/FasalNavbar";
import "./farm-intelligence.css";

type Weather = {
  temperature: number | null;
  humidity: number | null;
  rainfall: number | null;
  condition: string;
  weatherRisk: string;
};

type Signal = {
  id?: string;
  crop?: string;
  disease?: string;
  issue?: string;
  district?: string;
  location?: string;
  risk?: string;
  severity?: string;
  count?: number;
  signalCount?: number;
};

type AlertItem = {
  id?: string;
  crop?: string;
  state?: string;
  issue?: string;
  severity?: string;
  signalCount?: number;
  districts?: string[];
  createdAt?: string;
  message?: string;
};

const defaultWeather: Weather = {
  temperature: null,
  humidity: null,
  rainfall: null,
  condition: "Loading weather...",
  weatherRisk: "Unknown",
};

function getInitialDistrict() {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    const saved =
      sessionStorage.getItem(
        "fasal-analysis"
      );

    if (!saved) {
      return "";
    }

    const data = JSON.parse(saved);

    return typeof data?.district ===
      "string"
      ? data.district
      : "";
  } catch {
    return "";
  }
}

function normalize(value?: string | null) {
  return (value || "").trim().toLowerCase();
}

function getWeatherRisk(
  weatherRisk?: string
) {
  const risk = normalize(weatherRisk);

  if (risk.includes("high")) {
    return "high";
  }

  if (
    risk.includes("moderate") ||
    risk.includes("medium")
  ) {
    return "moderate";
  }

  return "low";
}

function getFarmImpact(
  weatherRisk?: string
) {
  const risk =
    getWeatherRisk(weatherRisk);

  if (risk === "high") {
    return "Attention";
  }

  if (risk === "moderate") {
    return "Watch";
  }

  return "Normal";
}

function getSignalTitle(
  signal: Signal
) {
  const crop = signal.crop?.trim();

  const issue =
    signal.disease?.trim() ||
    signal.issue?.trim();

  if (crop && issue) {
    return `${issue} — ${crop}`;
  }

  if (issue) {
    return issue;
  }

  if (crop) {
    return `${crop} health signal`;
  }

  return "Crop health signal";
}

function getSignalPlace(
  signal: Signal
) {
  return (
    signal.district?.trim() ||
    signal.location?.trim() ||
    "Regional observation"
  );
}

function getSignalSeverity(
  signal: Signal
) {
  return (
    signal.risk?.trim() ||
    signal.severity?.trim() ||
    "Monitoring"
  );
}

export default function FarmIntelligencePage() {
  const [district, setDistrict] =
    useState(getInitialDistrict);

  const [weather, setWeather] =
    useState<Weather>(
      defaultWeather
    );

  const [signals, setSignals] =
    useState<Signal[]>([]);

  const [alerts, setAlerts] =
    useState<AlertItem[]>([]);

  const [
    loadingWeather,
    setLoadingWeather,
  ] = useState(false);

  useEffect(() => {
    async function loadSignals() {
      try {
        const response =
          await fetch("/api/signals", {
            cache: "no-store",
          });

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        const raw =
          data?.signals ||
          data?.observations ||
          data?.data ||
          [];

        if (Array.isArray(raw)) {
          setSignals(raw);
        }
      } catch {
        setSignals([]);
      }
    }

    async function loadAlerts() {
      try {
        const response =
          await fetch("/api/alerts", {
            cache: "no-store",
          });

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        const raw =
          data?.alerts ||
          data?.data ||
          [];

        if (Array.isArray(raw)) {
          setAlerts(raw);
        }
      } catch {
        setAlerts([]);
      }
    }

    void loadSignals();
    void loadAlerts();
  }, []);

  useEffect(() => {
    if (!district.trim()) {
      return;
    }

    async function loadWeather() {
      setLoadingWeather(true);

      try {
        const response =
          await fetch(
            `/api/weather?district=${encodeURIComponent(
              district.trim()
            )}`,
            {
              cache: "no-store",
            }
          );

        if (!response.ok) {
          setWeather(defaultWeather);
          return;
        }

        const data =
          await response.json();

        if (data?.weather) {
          setWeather(data.weather);
        } else {
          setWeather(defaultWeather);
        }
      } catch {
        setWeather(defaultWeather);
      } finally {
        setLoadingWeather(false);
      }
    }

    void loadWeather();
  }, [district]);

  const regionalSignals =
    useMemo(() => {
      const selectedDistrict =
        normalize(district);

      if (!selectedDistrict) {
        return signals;
      }

      const matchingSignals =
        signals.filter((signal) => {
          const signalDistrict =
            normalize(
              signal.district ||
                signal.location
            );

          return (
            signalDistrict ===
              selectedDistrict ||
            signalDistrict.includes(
              selectedDistrict
            ) ||
            selectedDistrict.includes(
              signalDistrict
            )
          );
        });

      return matchingSignals;
    }, [signals, district]);

  const highRiskSignals =
    useMemo(() => {
      return regionalSignals.filter(
        (signal) => {
          const risk =
            `${signal.risk || ""} ${
              signal.severity || ""
            }`.toLowerCase();

          const reportCount =
            typeof signal.count ===
            "number"
              ? signal.count
              : typeof signal.signalCount ===
                "number"
              ? signal.signalCount
              : 0;

          const isHighRisk =
            risk.includes("high") ||
            risk.includes("critical") ||
            risk.includes("severe");

          return (
            isHighRisk &&
            reportCount > 5
          );
        }
      );
    }, [regionalSignals]);

  const affectedDistricts =
    useMemo(() => {
      const values =
        regionalSignals
          .map(
            (signal) =>
              signal.district ||
              signal.location
          )
          .filter(Boolean) as string[];

      return new Set(
        values.map((value) =>
          value
            .trim()
            .toLowerCase()
        )
      ).size;
    }, [regionalSignals]);

  const displayedSignals =
    useMemo(() => {
      const unique =
        new Map<string, Signal>();

      regionalSignals.forEach(
        (signal, index) => {
          const key = [
            normalize(signal.crop),
            normalize(
              signal.disease ||
                signal.issue
            ),
            normalize(
              signal.district ||
                signal.location
            ),
            index,
          ].join("|");

          unique.set(key, signal);
        }
      );

      return Array.from(
        unique.values()
      ).slice(0, 5);
    }, [regionalSignals]);

  const regionalAlerts =
    useMemo(() => {
      if (!district.trim()) {
        return alerts;
      }

      const selectedDistrict =
        district
          .trim()
          .toLowerCase();

      return alerts.filter(
        (alert) => {
          if (
            !alert.districts ||
            alert.districts.length === 0
          ) {
            return true;
          }

          return alert.districts.some(
            (item) =>
              item
                .trim()
                .toLowerCase() ===
              selectedDistrict
          );
        }
      );
    }, [alerts, district]);

  const weatherRisk =
    getWeatherRisk(
      weather.weatherRisk
    );

  const weatherRiskClass =
    weatherRisk === "high"
      ? "risk-high"
      : weatherRisk === "moderate"
      ? "risk-moderate"
      : "risk-low";

  const weatherRiskLabel =
    weatherRisk === "high"
      ? "High"
      : weatherRisk === "moderate"
      ? "Moderate"
      : "Low";

  const farmImpact =
    getFarmImpact(
      weather.weatherRisk
    );

  const regionalSignalWidth =
    Math.min(
      Math.max(
        regionalSignals.length * 8,
        8
      ),
      100
    );

  const districtWidth =
    Math.min(
      Math.max(
        affectedDistricts * 12,
        8
      ),
      100
    );

  const weatherWidth =
    weatherRisk === "high"
      ? "85%"
      : weatherRisk === "moderate"
      ? "55%"
      : "25%";

  return (
    <>
      <FasalNavbar />

      <main className="intelligence-page">
        <section className="intelligence-hero">
          <div>
            <p className="intelligence-eyebrow">
              <span />
              FARM INTELLIGENCE
            </p>

            <h1>
              <span className="heading-line">
                Understand what&apos;s
                happening
              </span>

              <span className="heading-line">
                <em>
                  around your farm.
                </em>
              </span>
            </h1>

            <p className="intelligence-intro">
              Weather conditions,
              regional crop signals
              and emerging risks
              brought together to help
              you make informed farm
              decisions.
            </p>
          </div>

          <div className="intelligence-location">
            <span>
              YOUR REGION
            </span>

            <div className="location-value">
              <span>📍</span>

              <input
                value={district}
                onChange={(event) =>
                  setDistrict(
                    event.target.value
                  )
                }
                placeholder="Enter district"
                aria-label="District"
              />

              {loadingWeather && (
                <span
                  className="location-loader"
                  aria-label="Loading weather"
                />
              )}
            </div>

            <small>
              Weather and regional
              intelligence use your
              selected district.
            </small>
          </div>
        </section>

        <section className="intelligence-grid">
          <div className="weather-panel">
            <div className="panel-heading">
              <div>
                <p>
                  CURRENT CONDITIONS
                </p>

                <h2>Weather</h2>
              </div>

              <Link href="/weather">
                Full forecast →
              </Link>
            </div>

            <div className="weather-main">
              <div className="weather-symbol">
                {weatherRisk === "high"
                  ? "🌧️"
                  : weather.temperature !==
                      null &&
                    weather.temperature >=
                      35
                  ? "☀️"
                  : "⛅"}
              </div>

              <div className="weather-main-info">
                <span className="weather-location">
                  {district ||
                    "Your district"}
                </span>

                <div className="weather-temperature">
                  {weather.temperature !==
                  null
                    ? `${weather.temperature}°`
                    : "—"}
                </div>

                <p>
                  {weather.condition ||
                    "Weather information unavailable"}
                </p>
              </div>

              <div
                className={`weather-risk-pill ${weatherRiskClass}`}
              >
                <span />
                {weatherRiskLabel} risk
              </div>
            </div>

            <div className="weather-mini-grid">
              <div>
                <span>
                  Humidity
                </span>

                <strong>
                  {weather.humidity !==
                  null
                    ? `${weather.humidity}%`
                    : "—"}
                </strong>
              </div>

              <div>
                <span>
                  Rainfall
                </span>

                <strong>
                  {weather.rainfall !==
                  null
                    ? `${weather.rainfall} mm`
                    : "—"}
                </strong>
              </div>

              <div>
                <span>
                  Farm impact
                </span>

                <strong>
                  {farmImpact}
                </strong>
              </div>
            </div>
          </div>

          <div className="risk-overview-panel">
            <div className="panel-heading">
              <div>
                <p>
                  REGIONAL PICTURE
                </p>

                <h2>
                  Risk Overview
                </h2>
              </div>

              <span className="live-indicator">
                <i />
                LIVE
              </span>
            </div>

            <div className="risk-number">
              <strong>
                {highRiskSignals.length}
              </strong>

              <span>
                high-risk signals
              </span>
            </div>

            <div className="risk-bars">
              <div className="risk-bar-row">
                <span>
                  Regional signals
                </span>

                <strong>
                  {regionalSignals.length}
                </strong>

                <div>
                  <i
                    style={{
                      width: `${regionalSignalWidth}%`,
                    }}
                  />
                </div>
              </div>

              <div className="risk-bar-row">
                <span>
                  Districts affected
                </span>

                <strong>
                  {affectedDistricts}
                </strong>

                <div>
                  <i
                    style={{
                      width: `${districtWidth}%`,
                    }}
                  />
                </div>
              </div>

              <div className="risk-bar-row">
                <span>
                  Weather risk
                </span>

                <strong>
                  {weatherRiskLabel}
                </strong>

                <div>
                  <i
                    className={
                      weatherRiskClass
                    }
                    style={{
                      width:
                        weatherWidth,
                    }}
                  />
                </div>
              </div>
            </div>

            <Link
              href="/dashboard"
              className="panel-action"
            >
              Explore regional dashboard →
            </Link>
          </div>
        </section>

        <section className="threat-section">
          <div className="section-title-row">
            <div>
              <p>
                EARLY WARNING SYSTEM
              </p>

              <h2>
                Emerging Threat Radar
              </h2>

              <span>
                Signals from farmers
                can reveal patterns
                before they become
                widespread problems.
              </span>
            </div>

            <Link
              href="/radar"
              className="radar-button"
            >
              Open radar →
            </Link>
          </div>

          <div className="threat-layout">
            <div className="radar-visual">
              <div className="radar-circle radar-one" />
              <div className="radar-circle radar-two" />
              <div className="radar-circle radar-three" />

              <div className="radar-sweep" />

              <div className="radar-center">
                <span>✦</span>
              </div>

              {displayedSignals.map(
                (signal, index) => (
                  <div
                    className={`signal-dot signal-dot-${
                      index + 1
                    }`}
                    key={
                      signal.id ||
                      `${getSignalTitle(
                        signal
                      )}-${index}`
                    }
                    title={getSignalTitle(
                      signal
                    )}
                  >
                    <span />
                  </div>
                )
              )}

              <div className="radar-label radar-label-top">
                REGIONAL
              </div>

              <div className="radar-label radar-label-bottom">
                SIGNAL NETWORK
              </div>
            </div>

            <div className="threat-list">
              {displayedSignals.length >
              0 ? (
                displayedSignals.map(
                  (
                    signal,
                    index
                  ) => {
                    const title =
                      getSignalTitle(
                        signal
                      );

                    const place =
                      getSignalPlace(
                        signal
                      );

                    const severity =
                      getSignalSeverity(
                        signal
                      );

                    return (
                      <div
                        className="threat-item"
                        key={
                          signal.id ||
                          `${title}-${place}-${index}`
                        }
                      >
                        <div className="threat-index">
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </div>

                        <div className="threat-content">
                          <div>
                            <span className="threat-type">
                              {signal.crop ||
                                "CROP SIGNAL"}
                            </span>

                            <span className="threat-severity">
                              {severity}
                            </span>
                          </div>

                          <h3
                            title={
                              title
                            }
                          >
                            {title}
                          </h3>

                          <p>
                            📍{" "}
                            {place}
                          </p>
                        </div>

                        <Link
                          href="/dashboard"
                          className="threat-arrow"
                          aria-label={`View regional details for ${title}`}
                        >
                          →
                        </Link>
                      </div>
                    );
                  }
                )
              ) : (
                <div className="no-signals">
                  <div>✦</div>

                  <h3>
                    No active regional
                    signals
                  </h3>

                  <p>
                    New farmer
                    observations will
                    appear here as the
                    signal network
                    detects patterns.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="alerts-section">
          <div className="section-title-row">
            <div>
              <p>
                FARMER SAFETY NET
              </p>

              <h2>
                Regional Alerts
              </h2>

              <span>
                Important conditions
                that may need
                attention in your
                region.
              </span>
            </div>

            <Link
              href="/alerts"
              className="text-link"
            >
              View all →
            </Link>
          </div>

          <div className="alerts-grid">
            {regionalAlerts.length >
            0 ? (
              regionalAlerts
                .slice(0, 3)
                .map(
                  (
                    alert,
                    index
                  ) => {
                    const alertTitle =
                      [
                        alert.crop,
                        alert.issue,
                      ]
                        .filter(Boolean)
                        .join(
                          " — "
                        ) ||
                      "Agricultural condition detected";

                    const districts =
                      alert.districts &&
                      alert.districts
                        .length >
                        0
                        ? alert.districts.join(
                            ", "
                          )
                        : district ||
                          "Regional";

                    return (
                      <div
                        className="alert-card"
                        key={
                          alert.id ||
                          `${alert.crop}-${alert.issue}-${index}`
                        }
                      >
                        <div className="alert-card-top">
                          <span className="alert-icon">
                            {index ===
                            0
                              ? "!"
                              : "◈"}
                          </span>

                          <span className="alert-label">
                            {alert.severity ||
                              "REGIONAL ALERT"}
                          </span>
                        </div>

                        <h3>
                          {alertTitle}
                        </h3>

                        <p>
                          {alert.message ||
                            "A regional agricultural signal may require monitoring."}
                        </p>

                        <div className="alert-footer">
                          <span>
                            📍{" "}
                            {districts}
                          </span>

                          <strong>
                            {alert.severity ||
                              "Monitor"}
                          </strong>
                        </div>
                      </div>
                    );
                  }
                )
            ) : (
              <>
                <div className="alert-card">
                  <div className="alert-card-top">
                    <span className="alert-icon">
                      ☀
                    </span>

                    <span className="alert-label">
                      WEATHER
                    </span>
                  </div>

                  <h3>
                    Weather-aware
                    farming
                  </h3>

                  <p>
                    Current weather
                    conditions are being
                    used to identify
                    potential irrigation
                    and crop-protection
                    risks.
                  </p>

                  <div className="alert-footer">
                    <span>
                      📍{" "}
                      {district ||
                        "Your region"}
                    </span>

                    <strong>
                      {weatherRiskLabel}
                    </strong>
                  </div>
                </div>

                <div className="alert-card">
                  <div className="alert-card-top">
                    <span className="alert-icon">
                      ◎
                    </span>

                    <span className="alert-label">
                      SIGNAL NETWORK
                    </span>
                  </div>

                  <h3>
                    Regional signals
                  </h3>

                  <p>
                    Fasal AI combines
                    farmer observations
                    to identify patterns
                    across nearby
                    districts.
                  </p>

                  <div className="alert-footer">
                    <span>
                      ◉{" "}
                      {
                        regionalSignals.length
                      }{" "}
                      signals
                    </span>

                    <strong>
                      Tracking
                    </strong>
                  </div>
                </div>

                <div className="alert-card">
                  <div className="alert-card-top">
                    <span className="alert-icon">
                      ✦
                    </span>

                    <span className="alert-label">
                      AI GUIDANCE
                    </span>
                  </div>

                  <h3>
                    Need a crop-specific
                    check?
                  </h3>

                  <p>
                    Upload a crop photo
                    and let Fasal AI
                    connect the
                    observation with
                    regional and weather
                    context.
                  </p>

                  <div className="alert-footer">
                    <Link href="/scan">
                      Start AI scan →
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="decision-section">
          <div className="decision-content">
            <p>
              FROM DATA TO ACTION
            </p>

            <h2>
              One view.
              <br />
              <span>
                Better farm decisions.
              </span>
            </h2>

            <div className="decision-flow">
              <div>
                <span>01</span>
                <strong>
                  Observe
                </strong>
                <small>
                  Crop photo or farmer
                  signal
                </small>
              </div>

              <b>→</b>

              <div>
                <span>02</span>
                <strong>
                  Understand
                </strong>
                <small>
                  AI + weather +
                  regional patterns
                </small>
              </div>

              <b>→</b>

              <div>
                <span>03</span>
                <strong>
                  Act
                </strong>
                <small>
                  Clear, practical
                  next steps
                </small>
              </div>
            </div>
          </div>

          <Link
            href="/scan"
            className="decision-button"
          >
            Check my crop with AI
            <span>→</span>
          </Link>
        </section>
      </main>
    </>
  );
}