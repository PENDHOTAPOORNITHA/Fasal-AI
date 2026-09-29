"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  BellRing,
  MapPin,
  Sprout,
} from "lucide-react";
import { useEffect, useState } from "react";
import "./alerts.css";

type Alert = {
  id: string;
  crop: string;
  state: string;
  issue: string;
  severity: string;
  signalCount: number;
  districts: string[];
  createdAt: string;
  message: string;
};

export default function AlertsPage() {
  const [alerts, setAlerts] =
    useState<Alert[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadAlerts() {
      try {
        const response = await fetch(
          "/api/alerts",
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (data.success) {
          setAlerts(data.alerts);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadAlerts();
  }, []);

  return (
    <main className="alerts-page">
      <header className="alerts-topbar">
        <Link href="/" className="alerts-back">
          <ArrowLeft size={17} />
          Back to home
        </Link>

        <div className="alerts-logo">
          ✦ Fasal<span>AI</span>
        </div>

        <div className="alerts-title-mini">
          SIGNAL ALERTS
        </div>
      </header>

      <section className="alerts-hero">
        <span>
          <BellRing size={15} />
          EARLY WARNING NETWORK
        </span>

        <h1>
          Agricultural
          <em> Alerts</em>
        </h1>

        <p>
          Fasal AI automatically identifies
          unusual patterns from recent
          privacy-protected agricultural
          observations.
        </p>
      </section>

      <section className="alerts-list">
        {loading ? (
          <div className="alerts-loading">
            Checking recent agricultural
            patterns...
          </div>
        ) : !alerts.length ? (
          <div className="alerts-empty">
            <Sprout size={40} />
            <h2>No major alerts detected</h2>
            <p>
              Current agricultural observations
              are being continuously monitored
              for emerging patterns.
            </p>
          </div>
        ) : (
          alerts.map((alert) => (
            <article
              className="alert-card"
              key={alert.id}
            >
              <div
                className={`alert-severity alert-${alert.severity.toLowerCase()}`}
              >
                <AlertTriangle size={18} />
                {alert.severity.toUpperCase()}
              </div>

              <div className="alert-main">
                <span>
                  {alert.crop.toUpperCase()} ·{" "}
                  {alert.state.toUpperCase()}
                </span>

                <h2>{alert.issue}</h2>

                <p>{alert.message}</p>

                <div className="alert-districts">
                  <MapPin size={15} />

                  <strong>
                    {alert.districts.length}{" "}
                    affected districts
                  </strong>

                  <div>
                    {alert.districts.map(
                      (district) => (
                        <span key={district}>
                          {district}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="alert-count">
                <strong>
                  {alert.signalCount}
                </strong>

                <span>similar signals</span>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}