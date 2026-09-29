"use client";

import "./calendar.css";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import FasalNavbar from "@/components/FasalNavbar";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Droplets,
  FlaskConical,
  Leaf,
  Sprout,
  Bug,
  Wheat,
  CircleAlert,
} from "lucide-react";

type Crop = {
  id: string;
  name: string;
  variety: string;
  field: string;
  area: string;
  plantingDate: string;
  harvestDate: string;
  growthStage: string;
  irrigation: string;
};

type CalendarTask = {
  id: string;
  date: string;
  crop: string;
  title: string;
  description: string;
  type: "planting" | "irrigation" | "fertilizer" | "pest" | "harvest";
};

const STORAGE_KEY = "fasal-my-crops";
const STORAGE_EVENT = "fasal-crops-updated";

const emptySubscribe = () => () => {};

function getCropsSnapshot() {
  if (typeof window === "undefined") return "[]";

  return localStorage.getItem(STORAGE_KEY) || "[]";
}

function getServerSnapshot() {
  return "[]";
}

/*
 * Returns the actual current calendar date in India.
 *
 * Example:
 * 2026-09-30
 * 2026-11-05
 *
 * This uses IST directly and does not use toISOString(),
 * so there is no UTC date shift.
 */
function getIndiaToday() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(new Date());
}

function parseDateParts(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);

  return {
    year,
    month,
    day,
  };
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(dateString: string, days: number) {
  const { year, month, day } = parseDateParts(dateString);

  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);

  return formatDate(date);
}

function formatDisplayDate(dateString: string) {
  const { year, month, day } = parseDateParts(dateString);

  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getTaskIcon(type: CalendarTask["type"]) {
  switch (type) {
    case "planting":
      return <Sprout size={17} />;

    case "irrigation":
      return <Droplets size={17} />;

    case "fertilizer":
      return <FlaskConical size={17} />;

    case "pest":
      return <Bug size={17} />;

    case "harvest":
      return <Wheat size={17} />;
  }
}

function getTaskClass(type: CalendarTask["type"]) {
  return `calendar-task-icon ${type}`;
}

export default function CalendarPage() {
  const cropsSnapshot = useSyncExternalStore(
    (callback) => {
      if (typeof window === "undefined") {
        return emptySubscribe();
      }

      window.addEventListener("storage", callback);
      window.addEventListener(STORAGE_EVENT, callback);

      return () => {
        window.removeEventListener("storage", callback);
        window.removeEventListener(STORAGE_EVENT, callback);
      };
    },
    getCropsSnapshot,
    getServerSnapshot
  );

  const crops = useMemo<Crop[]>(() => {
    try {
      const parsed = JSON.parse(cropsSnapshot);

      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [cropsSnapshot]);

  /*
   * ACTUAL CURRENT DATE IN INDIA
   */
  const todayString = getIndiaToday();
  const todayParts = parseDateParts(todayString);

  /*
   * Calendar initially opens on the current Indian month.
   *
   * IMPORTANT:
   * This is only the initial month.
   * Clicking previous/next month changes the displayed month
   * normally and does NOT return to today.
   */
  const [currentMonth, setCurrentMonth] = useState(
    () => new Date(todayParts.year, todayParts.month - 1, 1)
  );

  const [selectedCrop, setSelectedCrop] = useState("all");

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthName = currentMonth.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const tasks = useMemo<CalendarTask[]>(() => {
    const generated: CalendarTask[] = [];

    crops.forEach((crop) => {
      if (!crop.plantingDate) return;

      generated.push({
        id: `${crop.id}-planting`,
        date: crop.plantingDate,
        crop: crop.name,
        title: `${crop.name} planted`,
        description: `${crop.variety || "Crop"} was added to ${
          crop.field || "your field"
        }.`,
        type: "planting",
      });

      if (crop.irrigation) {
        generated.push({
          id: `${crop.id}-irrigation`,
          date: addDays(crop.plantingDate, 7),
          crop: crop.name,
          title: "Irrigation check",
          description: `${crop.name} may need an irrigation check.`,
          type: "irrigation",
        });

        generated.push({
          id: `${crop.id}-irrigation-2`,
          date: addDays(crop.plantingDate, 14),
          crop: crop.name,
          title: "Irrigation check",
          description:
            "Review soil moisture before the next irrigation.",
          type: "irrigation",
        });
      }

      generated.push({
        id: `${crop.id}-fertilizer`,
        date: addDays(crop.plantingDate, 21),
        crop: crop.name,
        title: "Nutrient check",
        description:
          "Check crop growth and plan the next nutrient application.",
        type: "fertilizer",
      });

      generated.push({
        id: `${crop.id}-pest`,
        date: addDays(crop.plantingDate, 30),
        crop: crop.name,
        title: "Pest & disease watch",
        description: `Inspect ${crop.name} leaves, stems and surrounding soil.`,
        type: "pest",
      });

      if (crop.harvestDate) {
        generated.push({
          id: `${crop.id}-harvest`,
          date: crop.harvestDate,
          crop: crop.name,
          title: `${crop.name} harvest`,
          description:
            "Expected harvest date based on your crop information.",
          type: "harvest",
        });
      }
    });

    return generated;
  }, [crops]);

  const filteredTasks = useMemo(() => {
    if (selectedCrop === "all") {
      return tasks;
    }

    return tasks.filter((task) => task.crop === selectedCrop);
  }, [tasks, selectedCrop]);

  const upcomingTasks = useMemo(() => {
    return filteredTasks
      .filter((task) => task.date >= todayString)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 6);
  }, [filteredTasks, todayString]);

  const monthTasks = useMemo(() => {
    return filteredTasks.filter((task) => {
      const {
        year: taskYear,
        month: taskMonth,
      } = parseDateParts(task.date);

      return (
        taskYear === year &&
        taskMonth === month + 1
      );
    });
  }, [filteredTasks, year, month]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const calendarCells: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day);
  }

  while (calendarCells.length % 7 !== 0) {
    calendarCells.push(null);
  }

  /*
   * ONLY changes the displayed month.
   *
   * There is intentionally NO "Today" button/function.
   */
  const goPreviousMonth = () => {
    setCurrentMonth(
      new Date(year, month - 1, 1)
    );
  };

  const goNextMonth = () => {
    setCurrentMonth(
      new Date(year, month + 1, 1)
    );
  };

  return (
    <>
      <FasalNavbar />

      <main className="calendar-page">
        <div className="calendar-container">

          {/* HEADER */}

          <header className="calendar-header">
            <div className="calendar-header-left">
              <Link
                href="/"
                className="back-button"
              >
                <ArrowLeft size={15} />
                Back to Fasal AI
              </Link>

              <div className="calendar-heading">
                <div className="calendar-title-icon">
                  <CalendarDays size={22} />
                </div>

                <div>
                  <p className="calendar-eyebrow">
                    FARM PLANNING
                  </p>

                  <h1 className="calendar-title">
                    Crop Calendar
                  </h1>
                </div>
              </div>
            </div>

            <Link
              href="/crops"
              className="manage-crops-button"
            >
              <Leaf size={16} />
              Manage Crops
            </Link>
          </header>

          {/* INTRO */}

          <section className="calendar-intro">
            <div>
              <p className="section-kicker">
                YOUR FARM TIMELINE
              </p>

              <h2>
                Know what needs attention next.
              </h2>

              <p>
                Track planting, irrigation, nutrient checks,
                pest monitoring and harvest dates for your crops.
              </p>
            </div>

            <div className="calendar-intro-stat">
              <span>Active crops</span>
              <strong>{crops.length}</strong>
            </div>
          </section>

          {crops.length === 0 ? (
            <section className="calendar-empty">
              <div className="calendar-empty-icon">
                <Sprout size={25} />
              </div>

              <h3>No crops added yet</h3>

              <p>
                Add your crops first and Fasal AI will create a
                farm timeline for you.
              </p>

              <Link
                href="/crops"
                className="primary-calendar-button"
              >
                Add Your First Crop
              </Link>
            </section>
          ) : (
            <>
              {/* CONTROLS */}

              <section className="calendar-controls">
                <div className="month-navigation">

                  <button
                    type="button"
                    className="month-arrow"
                    onClick={goPreviousMonth}
                    aria-label="Previous month"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <div className="current-month">
                    <CalendarDays size={17} />
                    <strong>{monthName}</strong>
                  </div>

                  <button
                    type="button"
                    className="month-arrow"
                    onClick={goNextMonth}
                    aria-label="Next month"
                  >
                    <ChevronRight size={18} />
                  </button>

                </div>

                <select
                  className="crop-filter"
                  value={selectedCrop}
                  onChange={(event) =>
                    setSelectedCrop(event.target.value)
                  }
                >
                  <option value="all">
                    All crops
                  </option>

                  {crops.map((crop) => (
                    <option
                      key={crop.id}
                      value={crop.name}
                    >
                      {crop.name}
                    </option>
                  ))}
                </select>
              </section>

              {/* CALENDAR */}

              <section className="calendar-layout">

                <div className="calendar-card">
                  <div className="weekdays">
                    <span>Sun</span>
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                  </div>

                  <div className="calendar-grid">
                    {calendarCells.map(
                      (day, index) => {
                        if (!day) {
                          return (
                            <div
                              key={`empty-${index}`}
                              className="calendar-day empty-day"
                            />
                          );
                        }

                        /*
                         * Build the exact calendar date.
                         *
                         * Example:
                         * September 30, 2026
                         * -> 2026-09-30
                         */
                        const dateString = formatDate(
                          new Date(
                            year,
                            month,
                            day
                          )
                        );

                        const dayTasks =
                          monthTasks.filter(
                            (task) =>
                              task.date === dateString
                          );

                        /*
                         * THIS IS THE ONLY PLACE WHERE
                         * "Today" IS SHOWN.
                         *
                         * It is true ONLY when the calendar
                         * date exactly matches today's date
                         * in India.
                         *
                         * Example:
                         *
                         * Actual India date:
                         * 2026-09-30
                         *
                         * Sep 30 -> Today
                         * Sep 29 -> normal
                         * Oct 30 -> normal
                         *
                         * If actual date becomes:
                         * 2026-11-05
                         *
                         * Nov 5 -> Today
                         * Nov 6 -> normal
                         * Sep 30 -> normal
                         */
                        const isToday =
                          dateString === todayString;

                        return (
                          <div
                            key={dateString}
                            className={`calendar-day ${
                              isToday
                                ? "today"
                                : ""
                            }`}
                          >
                            <div className="day-number">
                              <span>{day}</span>

                              {isToday && (
                                <small>
                                  Today
                                </small>
                              )}
                            </div>

                            <div className="day-tasks">
                              {dayTasks
                                .slice(0, 3)
                                .map((task) => (
                                  <div
                                    key={task.id}
                                    className={`calendar-event ${task.type}`}
                                    title={
                                      task.description
                                    }
                                  >
                                    {getTaskIcon(
                                      task.type
                                    )}

                                    <span>
                                      {task.title}
                                    </span>
                                  </div>
                                ))}

                              {dayTasks.length > 3 && (
                                <div className="more-events">
                                  +
                                  {dayTasks.length - 3}{" "}
                                  more
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* UPCOMING */}

                <aside className="upcoming-panel">
                  <div className="upcoming-heading">
                    <div>
                      <p className="section-kicker">
                        NEXT UP
                      </p>

                      <h3>
                        Upcoming tasks
                      </h3>
                    </div>

                    <CircleAlert size={19} />
                  </div>

                  {upcomingTasks.length === 0 ? (
                    <div className="no-upcoming">
                      <CalendarDays size={22} />

                      <p>
                        No upcoming tasks found for this crop.
                      </p>
                    </div>
                  ) : (
                    <div className="upcoming-list">
                      {upcomingTasks.map(
                        (task) => (
                          <div
                            key={task.id}
                            className="upcoming-task"
                          >
                            <div
                              className={getTaskClass(
                                task.type
                              )}
                            >
                              {getTaskIcon(
                                task.type
                              )}
                            </div>

                            <div className="upcoming-task-content">
                              <div className="upcoming-task-top">
                                <span>
                                  {task.crop}
                                </span>

                                <small>
                                  {formatDisplayDate(
                                    task.date
                                  )}
                                </small>
                              </div>

                              <h4>
                                {task.title}
                              </h4>

                              <p>
                                {task.description}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </aside>

              </section>

              {/* LEGEND */}

              <section className="calendar-legend">
                <span>
                  <i className="legend-dot planting" />
                  Planting
                </span>

                <span>
                  <i className="legend-dot irrigation" />
                  Irrigation
                </span>

                <span>
                  <i className="legend-dot fertilizer" />
                  Nutrients
                </span>

                <span>
                  <i className="legend-dot pest" />
                  Pest watch
                </span>

                <span>
                  <i className="legend-dot harvest" />
                  Harvest
                </span>
              </section>

              {/* INTELLIGENCE */}

              <section className="calendar-intelligence">
                <div className="calendar-intelligence-icon">
                  <Leaf size={20} />
                </div>

                <div>
                  <h3>
                    Your calendar will become smarter
                  </h3>

                  <p>
                    As Fasal AI grows, this timeline can combine
                    crop stage, weather, irrigation requirements,
                    regional signals and disease alerts to surface
                    the most relevant farm tasks automatically.
                  </p>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}