"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import FasalNavbar from "@/components/FasalNavbar";
import "./farm-economics.css";

type Expense = {
  id: string;
  category: string;
  description: string;
  amount: number;
};

type MarketCrop = {
  crop: string;
  mandi: string;
  price: number;
  unit: string;
  change: number;
};

const INITIAL_EXPENSES: Expense[] = [
  {
    id: "1",
    category: "Seeds",
    description: "Maize hybrid seeds",
    amount: 4800,
  },
  {
    id: "2",
    category: "Fertilizer",
    description: "NPK fertilizer",
    amount: 7200,
  },
  {
    id: "3",
    category: "Labour",
    description: "Field preparation and weeding",
    amount: 6500,
  },
  {
    id: "4",
    category: "Irrigation",
    description: "Drip irrigation and water charges",
    amount: 3000,
  },
  {
    id: "5",
    category: "Pesticides",
    description: "Crop protection treatment",
    amount: 2500,
  },
];

const MARKET_PRICES: MarketCrop[] = [
  {
    crop: "Paddy",
    mandi: "Hyderabad",
    price: 2380,
    unit: "quintal",
    change: 4.8,
  },
  {
    crop: "Cotton",
    mandi: "Warangal",
    price: 7160,
    unit: "quintal",
    change: 2.4,
  },
  {
    crop: "Maize",
    mandi: "Nizamabad",
    price: 2240,
    unit: "quintal",
    change: -1.2,
  },
  {
    crop: "Chilli",
    mandi: "Guntur",
    price: 11800,
    unit: "quintal",
    change: 6.1,
  },
  {
    crop: "Groundnut",
    mandi: "Telangana",
    price: 6500,
    unit: "quintal",
    change: 3.7,
  },
];

const SCHEMES = [
  {
    icon: "🌾",
    name: "PM-KISAN",
    description:
      "Income support scheme providing financial assistance to eligible farmer families.",
    tag: "Income Support",
    url: "https://pmkisan.gov.in/",
  },
  {
    icon: "🛡️",
    name: "PM Fasal Bima Yojana",
    description:
      "Crop insurance support against eligible crop losses caused by natural risks.",
    tag: "Crop Insurance",
    url: "https://pmfby.gov.in/",
  },
  {
    icon: "💧",
    name: "PM Krishi Sinchayee Yojana",
    description:
      "Supports improved irrigation access and efficient use of water resources.",
    tag: "Irrigation",
    url: "https://pmksy.gov.in/",
  },
];

const CATEGORY_ICONS: Record<string, string> = {
  Seeds: "🌱",
  Fertilizer: "🧪",
  Labour: "👨‍🌾",
  Irrigation: "💧",
  Pesticides: "🛡️",
  Machinery: "🚜",
  Other: "📦",
};

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function getCategoryIcon(category: string) {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS.Other;
}

function getCropIcon(crop: string) {
  switch (crop) {
    case "Paddy":
      return "🌾";
    case "Cotton":
      return "☁️";
    case "Maize":
      return "🌽";
    case "Chilli":
      return "🌶️";
    case "Groundnut":
      return "🥜";
    default:
      return "🌱";
  }
}

export default function FarmEconomicsPage() {
  const [expenses, setExpenses] =
    useState<Expense[]>(INITIAL_EXPENSES);

  const [showExpenseModal, setShowExpenseModal] =
    useState(false);

  const [selectedTab, setSelectedTab] =
    useState<"overview" | "market" | "schemes">(
      "overview"
    );

  const [category, setCategory] =
    useState("Seeds");

  const [description, setDescription] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const totalExpenses = useMemo(
    () =>
      expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      ),
    [expenses]
  );

  const projectedRevenue = 86000;

  const projectedProfit =
    projectedRevenue - totalExpenses;

  const profitMargin =
    projectedRevenue > 0
      ? Math.round(
          (projectedProfit / projectedRevenue) * 100
        )
      : 0;

  const expenseBreakdown = useMemo(() => {
    const grouped: Record<string, number> = {};

    expenses.forEach((expense) => {
      grouped[expense.category] =
        (grouped[expense.category] || 0) +
        expense.amount;
    });

    return Object.entries(grouped).sort(
      (a, b) => b[1] - a[1]
    );
  }, [expenses]);

  function addExpense() {
    const numericAmount = Number(amount);

    if (
      !description.trim() ||
      !numericAmount ||
      numericAmount <= 0
    ) {
      return;
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      category,
      description: description.trim(),
      amount: numericAmount,
    };

    setExpenses((current) => [
      ...current,
      newExpense,
    ]);

    setDescription("");
    setAmount("");
    setShowExpenseModal(false);
  }

  function deleteExpense(id: string) {
    setExpenses((current) =>
      current.filter(
        (expense) => expense.id !== id
      )
    );
  }

  return (
    <>
      <FasalNavbar />

      <main className="economics-page">
        <section className="economics-hero">
          <div className="hero-copy">
            <p className="economics-eyebrow">
              FARM ECONOMICS
            </p>

            <h1>
              Know where your farm
              <span>{" "}stands financially.</span>
            </h1>

            <p>
              Track farming expenses,
              understand potential profit,
              check market prices and
              discover schemes that can
              support your farm.
            </p>
          </div>

          <div className="profit-preview">
            <div className="profit-preview-top">
              <span>PROJECTED PROFIT</span>

              <span className="profit-status">
                ON TRACK
              </span>
            </div>

            <strong>
              {formatCurrency(projectedProfit)}
            </strong>

            <div className="profit-preview-bottom">
              <span>Expected revenue</span>

              <strong>
                {formatCurrency(projectedRevenue)}
              </strong>
            </div>
          </div>
        </section>

        <nav className="economics-tabs">
          <button
            className={
              selectedTab === "overview"
                ? "active"
                : ""
            }
            onClick={() =>
              setSelectedTab("overview")
            }
          >
            <span>📊</span>
            Overview
          </button>

          <button
            className={
              selectedTab === "market"
                ? "active"
                : ""
            }
            onClick={() =>
              setSelectedTab("market")
            }
          >
            <span>📈</span>
            Market Prices
          </button>

          <button
            className={
              selectedTab === "schemes"
                ? "active"
                : ""
            }
            onClick={() =>
              setSelectedTab("schemes")
            }
          >
            <span>🏛️</span>
            Government Schemes
          </button>
        </nav>

        {selectedTab === "overview" && (
          <>
            <section className="economics-stats">
              <div className="economics-stat-card">
                <div className="stat-symbol expense-symbol">
                  ₹
                </div>

                <div>
                  <span>Total expenses</span>

                  <strong>
                    {formatCurrency(totalExpenses)}
                  </strong>
                </div>
              </div>

              <div className="economics-stat-card">
                <div className="stat-symbol revenue-symbol">
                  ↗
                </div>

                <div>
                  <span>Expected revenue</span>

                  <strong>
                    {formatCurrency(projectedRevenue)}
                  </strong>
                </div>
              </div>

              <div className="economics-stat-card">
                <div className="stat-symbol profit-symbol">
                  ✓
                </div>

                <div>
                  <span>Projected profit</span>

                  <strong>
                    {formatCurrency(projectedProfit)}
                  </strong>
                </div>
              </div>

              <div className="economics-stat-card">
                <div className="stat-symbol margin-symbol">
                  %
                </div>

                <div>
                  <span>Profit margin</span>

                  <strong>{profitMargin}%</strong>
                </div>
              </div>
            </section>

            <section className="economics-content-grid">
              <div className="economics-main">
                <div className="economics-section-heading">
                  <div>
                    <p>FARM SPENDING</p>

                    <h2>Expenses</h2>
                  </div>

                  <button
                    className="add-expense-btn"
                    onClick={() =>
                      setShowExpenseModal(true)
                    }
                  >
                    + Add expense
                  </button>
                </div>

                <div className="expenses-card">
                  {expenses.length === 0 ? (
                    <div className="expenses-empty">
                      <span>💰</span>

                      <h3>No expenses added</h3>

                      <p>
                        Start recording your farm
                        spending to understand
                        your actual production
                        cost.
                      </p>
                    </div>
                  ) : (
                    expenses.map((expense) => (
                      <div
                        className="expense-row"
                        key={expense.id}
                      >
                        <div className="expense-icon">
                          {getCategoryIcon(
                            expense.category
                          )}
                        </div>

                        <div className="expense-info">
                          <strong>
                            {expense.description}
                          </strong>

                          <span>
                            {expense.category}
                          </span>
                        </div>

                        <strong className="expense-amount">
                          {formatCurrency(
                            expense.amount
                          )}
                        </strong>

                        <button
                          className="delete-expense"
                          onClick={() =>
                            deleteExpense(
                              expense.id
                            )
                          }
                          aria-label={`Delete ${expense.description}`}
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}

                  <div className="expense-total">
                    <span>Total farm spending</span>

                    <strong>
                      {formatCurrency(totalExpenses)}
                    </strong>
                  </div>
                </div>

                <div className="economics-section-heading breakdown-heading">
                  <div>
                    <p>WHERE YOUR MONEY GOES</p>

                    <h2>Expense Breakdown</h2>
                  </div>
                </div>

                <div className="breakdown-card">
                  {expenseBreakdown.length === 0 ? (
                    <p className="breakdown-empty">
                      Add expenses to see your
                      spending breakdown.
                    </p>
                  ) : (
                    expenseBreakdown.map(
                      ([name, value]) => {
                        const percentage =
                          totalExpenses > 0
                            ? Math.round(
                                (value /
                                  totalExpenses) *
                                  100
                              )
                            : 0;

                        return (
                          <div
                            className="breakdown-row"
                            key={name}
                          >
                            <div className="breakdown-top">
                              <span>
                                {getCategoryIcon(
                                  name
                                )}{" "}
                                {name}
                              </span>

                              <strong>
                                {formatCurrency(value)}
                              </strong>
                            </div>

                            <div className="breakdown-track">
                              <div
                                className="breakdown-fill"
                                style={{
                                  width: `${percentage}%`,
                                }}
                              />
                            </div>

                            <small>
                              {percentage}% of total
                              expenses
                            </small>
                          </div>
                        );
                      }
                    )
                  )}
                </div>
              </div>

              <aside className="economics-sidebar">
                <div className="profit-card">
                  <div className="profit-card-heading">
                    <span className="profit-orb">
                      ✦
                    </span>

                    <span>FASAL ESTIMATE</span>
                  </div>

                  <h3>Projected farm outcome</h3>

                  <div className="profit-number">
                    {formatCurrency(projectedProfit)}
                  </div>

                  <p>
                    Based on your current
                    expenses and estimated
                    crop revenue. Update your
                    costs as the season
                    progresses.
                  </p>

                  <div className="profit-mini-grid">
                    <div>
                      <span>Cost</span>

                      <strong>
                        {formatCurrency(totalExpenses)}
                      </strong>
                    </div>

                    <div>
                      <span>Revenue</span>

                      <strong>
                        {formatCurrency(projectedRevenue)}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="economics-tip">
                  <span>💡</span>

                  <div>
                    <strong>Smart farming tip</strong>

                    <p>
                      Recording every expense
                      makes it easier to identify
                      where you can reduce costs
                      without affecting crop
                      health.
                    </p>
                  </div>
                </div>
              </aside>
            </section>
          </>
        )}

        {selectedTab === "market" && (
          <section className="market-section">
            <div className="market-heading">
              <div>
                <p>MARKET INTELLIGENCE</p>

                <h2>Indicative crop prices</h2>

                <span>
                  Reference mandi prices for
                  selected crops. Actual rates
                  vary by market, quality and
                  date.
                </span>
              </div>

              <div className="market-live">
                <span />
                INDICATIVE VIEW
              </div>
            </div>

            <div className="market-grid">
              {MARKET_PRICES.map((item) => (
                <div
                  className="market-card"
                  key={item.crop}
                >
                  <div className="market-card-top">
                    <div className="market-crop-icon">
                      {getCropIcon(item.crop)}
                    </div>

                    <span
                      className={
                        item.change >= 0
                          ? "price-change positive"
                          : "price-change negative"
                      }
                    >
                      {item.change >= 0 ? "↑" : "↓"}{" "}
                      {Math.abs(item.change)}%
                    </span>
                  </div>

                  <h3>{item.crop}</h3>

                  <p className="market-location">
                    📍 {item.mandi} mandi
                  </p>

                  <div className="market-price">
                    <strong>
                      {formatCurrency(item.price)}
                    </strong>

                    <span>/ {item.unit}</span>
                  </div>

                  <div className="market-bar">
                    <div
                      style={{
                        width: `${Math.min(
                          95,
                          Math.max(
                            25,
                            45 + item.change * 5
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="market-note">
              <span>ⓘ</span>

              <p>
                These figures are indicative
                reference values for the demo,
                not a live price feed. Verify the
                latest local mandi rate before
                making a selling decision.
              </p>
            </div>
          </section>
        )}

        {selectedTab === "schemes" && (
          <section className="schemes-section">
            <div className="schemes-heading">
              <div>
                <p>FARMER SUPPORT</p>

                <h2>Government schemes</h2>

                <span>
                  Explore programs that may
                  provide financial, insurance or
                  irrigation support.
                </span>
              </div>
            </div>

            <div className="schemes-grid">
              {SCHEMES.map((scheme) => (
                <article
                  className="scheme-card"
                  key={scheme.name}
                >
                  <div className="scheme-icon">
                    {scheme.icon}
                  </div>

                  <span className="scheme-tag">
                    {scheme.tag}
                  </span>

                  <h3>{scheme.name}</h3>

                  <p>{scheme.description}</p>

                  <a
                    className="scheme-link"
                    href={scheme.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Official portal{" "}
                    <span>↗</span>
                  </a>
                </article>
              ))}
            </div>

            <div className="scheme-disclaimer">
              <span>🏛️</span>

              <div>
                <strong>
                  Check official eligibility
                  before applying
                </strong>

                <p>
                  Scheme rules, eligibility,
                  benefits and application
                  windows can change. Always
                  verify the latest information
                  through the relevant government
                  portal or department.
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="economics-footer-cta">
          <div>
            <p>CONNECT THE DOTS</p>

            <h2>
              Turn farm data into better
              decisions.
            </h2>

            <span>
              Your crops, weather, regional
              signals and economics can work
              together inside Fasal AI.
            </span>
          </div>

          <Link href="/farm-intelligence">
            Explore Farm Intelligence →
          </Link>
        </section>

        {showExpenseModal && (
          <div
            className="expense-modal-overlay"
            onClick={() =>
              setShowExpenseModal(false)
            }
          >
            <div
              className="expense-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="modal-heading">
                <div>
                  <p>FARM SPENDING</p>

                  <h2>Add an expense</h2>
                </div>

                <button
                  className="modal-close"
                  onClick={() =>
                    setShowExpenseModal(false)
                  }
                >
                  ×
                </button>
              </div>

              <label>
                Category

                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value)
                  }
                >
                  <option>Seeds</option>
                  <option>Fertilizer</option>
                  <option>Labour</option>
                  <option>Irrigation</option>
                  <option>Pesticides</option>
                  <option>Machinery</option>
                  <option>Other</option>
                </select>
              </label>

              <label>
                Description

                <input
                  type="text"
                  placeholder="e.g. Rice seeds"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                />
              </label>

              <label>
                Amount

                <div className="amount-input">
                  <span>₹</span>

                  <input
                    type="number"
                    min="1"
                    placeholder="0"
                    value={amount}
                    onChange={(event) =>
                      setAmount(event.target.value)
                    }
                  />
                </div>
              </label>

              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={() =>
                    setShowExpenseModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  className="save-expense-btn"
                  onClick={addExpense}
                >
                  Add expense
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}