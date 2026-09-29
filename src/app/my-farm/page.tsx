"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import FasalNavbar from "@/components/FasalNavbar";
import "./my-farm.css";

type Crop = {
  id: string;
  name: string;
  variety?: string;
  field?: string;
  area?: string;
  plantingDate?: string;
  harvestDate?: string;
  growthStage?: string;
  irrigation?: string;
};

const STORAGE_KEY = "fasal-my-crops";
const UPDATE_EVENT = "fasal-crops-updated";

const emptySubscribe = () => () => {};

function getSnapshot() {
  if (typeof window === "undefined") return "[]";
  return localStorage.getItem(STORAGE_KEY) || "[]";
}

function getServerSnapshot() {
  return "[]";
}

function readCrops(): Crop[] {
  try {
    const data = JSON.parse(getSnapshot());
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function formatDate(date?: string) {
  if (!date) return "Not set";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function daysUntil(date?: string) {
  if (!date) return null;

  const target = new Date(date);
  if (Number.isNaN(target.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  return Math.ceil(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
}

function getGrowthProgress(stage?: string) {
  const value = (stage || "").toLowerCase();

  if (value.includes("seed")) return 15;
  if (value.includes("germ")) return 25;
  if (value.includes("veget")) return 45;
  if (value.includes("flower")) return 65;
  if (value.includes("fruit")) return 80;
  if (value.includes("matur")) return 95;
  if (value.includes("harvest")) return 100;

  return 50;
}

function getIrrigationLabel(irrigation?: string) {
  if (!irrigation) return "Not specified";

  return irrigation.length > 18
    ? `${irrigation.slice(0, 18)}…`
    : irrigation;
}

export default function MyFarmPage() {
  const cropsJson = useSyncExternalStore(
    (callback) => {
      if (typeof window === "undefined") return () => {};

      window.addEventListener("storage", callback);
      window.addEventListener(UPDATE_EVENT, callback);

      return () => {
        window.removeEventListener("storage", callback);
        window.removeEventListener(UPDATE_EVENT, callback);
      };
    },
    getSnapshot,
    getServerSnapshot
  );

  let crops: Crop[] = [];

  try {
    const parsed = JSON.parse(cropsJson);
    crops = Array.isArray(parsed) ? parsed : [];
  } catch {
    crops = [];
  }

  const totalArea = crops.reduce((sum, crop) => {
    const area = parseFloat(
      String(crop.area || "").replace(/[^0-9.]/g, "")
    );
    return sum + (Number.isNaN(area) ? 0 : area);
  }, 0);

  const harvestCrops = crops
    .map((crop) => ({
      ...crop,
      days: daysUntil(crop.harvestDate),
    }))
    .filter((crop) => crop.days !== null)
    .sort((a, b) => (a.days ?? 9999) - (b.days ?? 9999))
    .slice(0, 3);

  const irrigationCount = crops.filter(
    (crop) => crop.irrigation && crop.irrigation.trim()
  ).length;

  return (
    <main className="my-farm-page">
      <FasalNavbar />

      <section className="farm-hero">
        <div>
          <p className="farm-eyebrow">YOUR FARM WORKSPACE</p>
          <h1>
            Everything about your farm,
            <span> in one place.</span>
          </h1>
          <p className="farm-hero-text">
            Keep track of your crops, planting schedule, irrigation and
            day-to-day farm activities.
          </p>
        </div>

        <Link href="/crops" className="primary-farm-btn">
          + Add Crop
        </Link>
      </section>

      <section className="farm-stats">
        <div className="farm-stat-card">
          <div className="farm-stat-icon">🌱</div>
          <div>
            <span>Active crops</span>
            <strong>{crops.length}</strong>
          </div>
        </div>

        <div className="farm-stat-card">
          <div className="farm-stat-icon">📐</div>
          <div>
            <span>Total area</span>
            <strong>
              {totalArea > 0 ? `${totalArea.toFixed(1)} ac` : "—"}
            </strong>
          </div>
        </div>

        <div className="farm-stat-card">
          <div className="farm-stat-icon">💧</div>
          <div>
            <span>Irrigation tracked</span>
            <strong>
              {irrigationCount}/{crops.length || 0}
            </strong>
          </div>
        </div>

        <div className="farm-stat-card">
          <div className="farm-stat-icon">🌾</div>
          <div>
            <span>Upcoming harvests</span>
            <strong>{harvestCrops.length}</strong>
          </div>
        </div>
      </section>

      <section className="farm-content-grid">
        <div className="farm-main-column">
          <div className="farm-section-heading">
            <div>
              <p>YOUR FIELD</p>
              <h2>My Crops</h2>
            </div>

            <Link href="/crops">View all →</Link>
          </div>

          {crops.length === 0 ? (
            <div className="farm-empty-card">
              <div className="empty-illustration">🌱</div>
              <h3>Your farm starts here</h3>
              <p>
                Add your first crop to start tracking growth, irrigation and
                harvest dates.
              </p>
              <Link href="/crops" className="secondary-farm-btn">
                Add your first crop
              </Link>
            </div>
          ) : (
            <div className="crop-preview-grid">
              {crops.slice(0, 4).map((crop) => {
                const progress = getGrowthProgress(crop.growthStage);
                const days = daysUntil(crop.harvestDate);

                return (
                  <Link
                    href="/crops"
                    className="crop-preview-card"
                    key={crop.id}
                  >
                    <div className="crop-card-top">
                      <div className="crop-emoji">🌿</div>
                      <span className="crop-stage">
                        {crop.growthStage || "Growing"}
                      </span>
                    </div>

                    <h3>{crop.name}</h3>

                    {crop.variety && (
                      <p className="crop-variety">{crop.variety}</p>
                    )}

                    <div className="crop-details">
                      <span>📍 {crop.field || "Field not set"}</span>
                      <span>
                        💧 {getIrrigationLabel(crop.irrigation)}
                      </span>
                    </div>

                    <div className="growth-area">
                      <div className="growth-label">
                        <span>Growth</span>
                        <strong>{progress}%</strong>
                      </div>

                      <div className="growth-track">
                        <div
                          className="growth-fill"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="harvest-row">
                      <span>Harvest</span>
                      <strong>
                        {days === null
                          ? "Not set"
                          : days < 0
                          ? "Overdue"
                          : days === 0
                          ? "Today"
                          : `${days} days`}
                      </strong>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="farm-section-heading second-heading">
            <div>
              <p>PLAN AHEAD</p>
              <h2>Upcoming Activities</h2>
            </div>

            <Link href="/calendar">Open calendar →</Link>
          </div>

          <div className="activity-card">
            {harvestCrops.length === 0 ? (
              <div className="activity-empty">
                <span>📅</span>
                <div>
                  <strong>No upcoming activities yet</strong>
                  <p>
                    Add crop planting and harvest dates to build your farm
                    schedule.
                  </p>
                </div>
              </div>
            ) : (
              harvestCrops.map((crop, index) => (
                <div className="activity-item" key={crop.id}>
                  <div className="activity-date">
                    <strong>
                      {crop.harvestDate
                        ? new Date(crop.harvestDate).getDate()
                        : "—"}
                    </strong>
                    <span>
                      {crop.harvestDate
                        ? new Date(
                            crop.harvestDate
                          ).toLocaleDateString("en-IN", {
                            month: "short",
                          })
                        : ""}
                    </span>
                  </div>

                  <div className="activity-line" />

                  <div className="activity-info">
                    <span className="activity-tag">HARVEST</span>
                    <h3>{crop.name}</h3>
                    <p>
                      {crop.days === 0
                        ? "Harvest is due today"
                        : crop.days !== null && crop.days > 0
                        ? `Expected in ${crop.days} days`
                        : "Harvest date has passed"}
                    </p>
                  </div>

                  {index === 0 && (
                    <span className="next-badge">NEXT</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <aside className="farm-side-column">
          <div className="quick-actions-card">
            <p className="side-eyebrow">QUICK ACTIONS</p>
            <h2>Farm tools</h2>

            <Link href="/crops" className="quick-action">
              <span className="quick-icon">🌱</span>
              <div>
                <strong>Manage Crops</strong>
                <small>Add, edit or track crops</small>
              </div>
              <span>→</span>
            </Link>

            <Link href="/calendar" className="quick-action">
              <span className="quick-icon">📅</span>
              <div>
                <strong>Crop Calendar</strong>
                <small>Plan upcoming activities</small>
              </div>
              <span>→</span>
            </Link>

            <Link href="/weather" className="quick-action">
              <span className="quick-icon">☀️</span>
              <div>
                <strong>Weather</strong>
                <small>Check conditions & risk</small>
              </div>
              <span>→</span>
            </Link>

            <Link href="/scan" className="quick-action">
              <span className="quick-icon">📷</span>
              <div>
                <strong>AI Crop Scan</strong>
                <small>Check crop health with AI</small>
              </div>
              <span>→</span>
            </Link>
          </div>

          <div className="farm-tip-card">
            <div className="tip-icon">✦</div>
            <p className="side-eyebrow">FASAL AI TIP</p>
            <h3>Keep your crop records updated</h3>
            <p>
              Accurate planting and harvest dates help Fasal AI generate more
              useful farm recommendations.
            </p>
            <Link href="/calendar">View my calendar →</Link>
          </div>

          <div className="farm-intelligence-card">
            <div className="intelligence-top">
              <span className="ai-orb">✦</span>
              <span>FASAL INTELLIGENCE</span>
            </div>

            <h3>
              Your farm data powers smarter recommendations.
            </h3>

            <p>
              Crop information, weather and regional signals can work together
              to give you more relevant decisions.
            </p>

            <Link href="/dashboard">
              Explore farm intelligence →
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}