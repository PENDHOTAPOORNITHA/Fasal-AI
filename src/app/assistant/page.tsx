"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import FasalNavbar from "@/components/FasalNavbar";
import "./assistant.css";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

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

type ConnectedContext = {
  crops: Crop[];
  analysis: unknown;
  weather: unknown;
  signals: unknown;
  alerts: unknown;
  location: string;
};

const STORAGE_KEY = "fasal-my-crops";
const ANALYSIS_KEY = "fasal-analysis";

const FARM_WEATHER_LOCATION = "Hyderabad";

const SUGGESTED_QUESTIONS = [
  {
    icon: "🌱",
    text: "How should I take care of my crop this week?",
  },
  {
    icon: "💧",
    text: "Should I irrigate my crop today?",
  },
  {
    icon: "🐛",
    text: "What should I do if I see pests on my crop?",
  },
  {
    icon: "🌦️",
    text: "How can weather affect my crop?",
  },
];

const STARTER_MESSAGE: Message = {
  id: "starter",
  role: "assistant",
  text:
    "Namaste! I'm Fasal AI. 🌱\n\n" +
    "I can help you understand your crops, plan farm activities, " +
    "manage irrigation, respond to pests and diseases, and make " +
    "better farm decisions.\n\n" +
    "Ask me anything about your farm.",
};

function createMessageId(
  role: Message["role"]
) {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `${role}-${crypto.randomUUID()}`;
  }

  return `${role}-${Math.random()
    .toString(36)
    .slice(2)}-${Date.now()}`;
}

function readStoredCrops(): Crop[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return [];

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readStoredAnalysis(): unknown {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw =
      sessionStorage.getItem(ANALYSIS_KEY);

    if (!raw) return null;

    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function findLocation(value: unknown): string {
  if (!value) return "";

  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value !== "object") {
    return "";
  }

  const object =
    value as Record<string, unknown>;

  const keys = [
    "district",
    "location",
    "city",
    "place",
    "region",
    "area",
  ];

  for (const key of keys) {
    if (
      typeof object[key] === "string" &&
      object[key].trim()
    ) {
      return object[key].trim();
    }
  }

  for (const child of Object.values(object)) {
    const nested = findLocation(child);

    if (nested) {
      return nested;
    }
  }

  return "";
}

function formatCropContext(crops: Crop[]) {
  if (!crops.length) {
    return "No crops have been added to My Farm yet.";
  }

  return crops
    .map((crop) => {
      return [
        `Crop: ${crop.name}`,
        crop.variety
          ? `Variety: ${crop.variety}`
          : "",
        crop.field
          ? `Field: ${crop.field}`
          : "",
        crop.area
          ? `Area: ${crop.area}`
          : "",
        crop.growthStage
          ? `Growth stage: ${crop.growthStage}`
          : "",
        crop.irrigation
          ? `Irrigation: ${crop.irrigation}`
          : "",
        crop.plantingDate
          ? `Planting date: ${crop.plantingDate}`
          : "",
        crop.harvestDate
          ? `Harvest date: ${crop.harvestDate}`
          : "",
      ]
        .filter(Boolean)
        .join(" | ");
    })
    .join("\n");
}

function formatConnectedContext(
  context: ConnectedContext
) {
  const analysisText = context.analysis
    ? JSON.stringify(
        context.analysis,
        null,
        2
      )
    : "No recent crop scan is available.";

  const weatherText = context.weather
    ? JSON.stringify(
        context.weather,
        null,
        2
      )
    : "Weather data is not currently available.";

  const signalsText = context.signals
    ? JSON.stringify(
        context.signals,
        null,
        2
      )
    : "No regional signal data is currently available.";

  const alertsText = context.alerts
    ? JSON.stringify(
        context.alerts,
        null,
        2
      )
    : "No alert data is currently available.";

  const analysisObject =
    context.analysis &&
    typeof context.analysis === "object"
      ? (context.analysis as Record<
          string,
          unknown
        >)
      : null;

  const scanLocation =
    typeof analysisObject?.district ===
    "string"
      ? analysisObject.district
      : "";

  const currentScanCrop =
    typeof analysisObject?.crop ===
    "string"
      ? analysisObject.crop
      : "Unknown";

  return `
FARM LOCATION:
${context.location || "Location not yet provided."}

MY FARM CROPS:
${formatCropContext(context.crops)}

CURRENT SCANNED CROP:
${currentScanCrop}

LATEST SCAN LOCATION:
${scanLocation || "Not available"}

LATEST CROP SCAN:
${analysisText}

CURRENT FARM WEATHER LOCATION:
${FARM_WEATHER_LOCATION}

CURRENT WEATHER CONTEXT:
${weatherText}

REGIONAL SIGNALS:
${signalsText}

FARM ALERTS:
${alertsText}

IMPORTANT CONTEXT RULE:

The latest crop scan location is only the location where the crop was scanned.

Do NOT use the latest scan location as the farm's weather location.

CURRENT FARM WEATHER LOCATION is:
${FARM_WEATHER_LOCATION}

If the farmer asks about farm weather, use CURRENT FARM WEATHER LOCATION.

If the farmer asks about the latest scan, use the scan's own crop and scan location.

Do not mix these two contexts.

IMPORTANT CROP RULE:

The CURRENT SCANNED CROP is the crop from the latest scan.

If the farmer explicitly asks about another crop, use that crop instead.

Do not treat a regional signal or alert for another crop as a direct warning for the current crop.
`.trim();
}

function cleanResponse(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/^\s*#{1,6}\s?/gm, "")
    .trim();
}

export default function AssistantPage() {
  const [messages, setMessages] =
    useState<Message[]>([
      STARTER_MESSAGE,
    ]);

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [crops, setCrops] =
    useState<Crop[]>([]);

  const [farmContext, setFarmContext] =
    useState("");

  const [contextStatus, setContextStatus] =
    useState({
      weather: false,
      signals: false,
      alerts: false,
      analysis: false,
    });

  const messagesEndRef =
    useRef<HTMLDivElement | null>(
      null
    );

  useEffect(() => {
    async function loadConnectedContext() {
      const storedCrops =
        readStoredCrops();

      const analysis =
        readStoredAnalysis();

      setCrops(storedCrops);

      const detectedLocation =
        analysis &&
        typeof analysis === "object" &&
        typeof (
          analysis as Record<
            string,
            unknown
          >
        ).district === "string"
          ? String(
              (
                analysis as Record<
                  string,
                  unknown
                >
              ).district
            )
          : findLocation(analysis);

      let weather: unknown = null;
      let signals: unknown = null;
      let alerts: unknown = null;

      try {
        const response =
          await fetch(
            `/api/weather?district=${encodeURIComponent(
              FARM_WEATHER_LOCATION
            )}`,
            {
              cache: "no-store",
            }
          );

        if (response.ok) {
          const data =
            await response.json();

          if (
            data?.success !== false
          ) {
            weather =
              data.weather ?? data;
          }
        }
      } catch {
        weather = null;
      }

      try {
        const response =
          await fetch("/api/signals");

        if (response.ok) {
          const data =
            await response.json();

          signals = data;
        }
      } catch {
        signals = null;
      }

      try {
        const response =
          await fetch("/api/alerts");

        if (response.ok) {
          const data =
            await response.json();

          alerts = data;
        }
      } catch {
        alerts = null;
      }

      const connected: ConnectedContext = {
        crops: storedCrops,
        analysis,
        weather,
        signals,
        alerts,
        location:
          FARM_WEATHER_LOCATION,
      };

      if (
        analysis &&
        typeof analysis === "object" &&
        detectedLocation
      ) {
        const enrichedAnalysis = {
          ...(analysis as Record<
            string,
            unknown
          >),
          district:
            (
              analysis as Record<
                string,
                unknown
              >
            ).district ??
            detectedLocation,
        };

        connected.analysis =
          enrichedAnalysis;
      }

      setFarmContext(
        formatConnectedContext(
          connected
        )
      );

      setContextStatus({
        weather: Boolean(weather),
        signals: Boolean(signals),
        alerts: Boolean(alerts),
        analysis: Boolean(analysis),
      });
    }

    void loadConnectedContext();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView(
      {
        behavior: "smooth",
      }
    );
  }, [messages, loading]);

  const contextSummary =
    useMemo(() => {
      if (!crops.length) {
        return "Add crops in My Farm to give Fasal more context.";
      }

      if (crops.length === 1) {
        return `${crops[0].name} is connected`;
      }

      return `${crops.length} crops connected`;
    }, [crops]);

  async function sendMessage(
    messageText?: string
  ) {
    const text =
      (
        messageText ??
        input
      ).trim();

    if (!text || loading) {
      return;
    }

    const userMessage: Message = {
      id: createMessageId("user"),
      role: "user",
      text,
    };

    setMessages(
      (current) => [
        ...current,
        userMessage,
      ]
    );

    setInput("");
    setLoading(true);

    try {
      const conversation =
        [
          ...messages,
          userMessage,
        ]
          .slice(-10)
          .map((message) => ({
            role: message.role,
            text: message.text,
          }));

      const response =
        await fetch(
          "/api/assistant",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              message: text,
              conversation,
              farmContext,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to reach Fasal AI."
        );
      }

      const assistantText =
        typeof data?.reply ===
        "string"
          ? data.reply
          : "I couldn't generate a response right now. Please try again.";

      setMessages(
        (current) => [
          ...current,
          {
            id: createMessageId(
              "assistant"
            ),
            role: "assistant",
            text: cleanResponse(
              assistantText
            ),
          },
        ]
      );
    } catch {
      setMessages(
        (current) => [
          ...current,
          {
            id: createMessageId(
              "assistant"
            ),
            role: "assistant",
            text:
              "I'm having trouble connecting to the AI service right now. Please try again in a moment.",
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    void sendMessage();
  }

  function clearChat() {
    setMessages([
      STARTER_MESSAGE,
    ]);

    setInput("");
  }

  return (
    <>
      <FasalNavbar />

      <main className="assistant-page">
        <section className="assistant-layout">
          <aside className="assistant-sidebar">
            <div className="assistant-intro-card">
              <div className="ai-large-orb">
                <span>✦</span>
              </div>

              <p className="assistant-eyebrow">
                FASAL INTELLIGENCE
              </p>

              <h1>
                Your farm&apos;s AI companion.
              </h1>

              <p>
                Ask questions in simple
                language and get practical
                guidance based on your crops
                and farm context.
              </p>
            </div>

            <div className="context-card">
              <div className="context-heading">
                <span>
                  CONNECTED CONTEXT
                </span>

                <div className="context-dot" />
              </div>

              <div className="context-item">
                <span className="context-icon">
                  🌱
                </span>

                <div>
                  <strong>
                    My Farm
                  </strong>

                  <small>
                    {contextSummary}
                  </small>
                </div>
              </div>

              <div className="context-item">
                <span className="context-icon">
                  🌦️
                </span>

                <div>
                  <strong>
                    Weather
                  </strong>

                  <small>
                    {contextStatus.weather
                      ? "Live farm weather connected"
                      : "Available through Farm Intelligence"}
                  </small>
                </div>
              </div>

              <div className="context-item">
                <span className="context-icon">
                  📷
                </span>

                <div>
                  <strong>
                    Crop Scan
                  </strong>

                  <small>
                    {contextStatus.analysis
                      ? "Latest scan connected"
                      : "No recent scan available"}
                  </small>
                </div>
              </div>

              <div className="context-item">
                <span className="context-icon">
                  📊
                </span>

                <div>
                  <strong>
                    Regional signals
                  </strong>

                  <small>
                    {contextStatus.signals
                      ? "Regional data connected"
                      : "No signal data available"}
                  </small>
                </div>
              </div>

              <div className="context-item">
                <span className="context-icon">
                  🚨
                </span>

                <div>
                  <strong>
                    Alerts
                  </strong>

                  <small>
                    {contextStatus.alerts
                      ? "Farm alerts connected"
                      : "No alert data available"}
                  </small>
                </div>
              </div>
            </div>

            <div className="assistant-links-card">
              <p>
                EXPLORE FASAL
              </p>

              <Link href="/scan">
                <span>📷</span>
                AI Crop Scan
                <b>→</b>
              </Link>

              <Link href="/farm-intelligence">
                <span>📡</span>
                Farm Intelligence
                <b>→</b>
              </Link>

              <Link href="/farm-economics">
                <span>₹</span>
                Farm Economics
                <b>→</b>
              </Link>
            </div>
          </aside>

          <section className="chat-panel">
            <div className="chat-header">
              <div className="chat-agent">
                <div className="agent-avatar">
                  <span>✦</span>
                  <i />
                </div>

                <div>
                  <strong>
                    Fasal AI Assistant
                  </strong>

                  <span>
                    <i />
                    Ready to help
                  </span>
                </div>
              </div>

              <button
                className="clear-chat"
                onClick={clearChat}
                type="button"
              >
                Clear chat
              </button>
            </div>

            <div className="chat-messages">
              <div className="chat-date">
                TODAY
              </div>

              {messages.map(
                (message) => (
                  <div
                    className={`message-row ${
                      message.role ===
                      "user"
                        ? "user-row"
                        : "assistant-row"
                    }`}
                    key={message.id}
                  >
                    {message.role ===
                      "assistant" && (
                      <div className="message-avatar">
                        ✦
                      </div>
                    )}

                    <div
                      className={`message-bubble ${
                        message.role ===
                        "user"
                          ? "user-bubble"
                          : "assistant-bubble"
                      }`}
                    >
                      {message.text
                        .split("\n")
                        .map(
                          (
                            line,
                            index
                          ) => (
                            <span
                              key={`${message.id}-${index}`}
                            >
                              {line}

                              {index <
                                message.text.split(
                                  "\n"
                                ).length -
                                  1 && (
                                <br />
                              )}
                            </span>
                          )
                        )}
                    </div>
                  </div>
                )
              )}

              {loading && (
                <div className="message-row assistant-row">
                  <div className="message-avatar">
                    ✦
                  </div>

                  <div className="typing-bubble">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {messages.length === 1 &&
              !loading && (
                <div className="suggestions-area">
                  <p>
                    TRY ASKING
                  </p>

                  <div className="suggestion-grid">
                    {SUGGESTED_QUESTIONS.map(
                      (
                        question
                      ) => (
                        <button
                          key={
                            question.text
                          }
                          type="button"
                          onClick={() =>
                            void sendMessage(
                              question.text
                            )
                          }
                        >
                          <span>
                            {
                              question.icon
                            }
                          </span>

                          {
                            question.text
                          }
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

            <form
              className="chat-input-area"
              onSubmit={handleSubmit}
            >
              <div className="chat-input-wrapper">
                <textarea
                  value={input}
                  onChange={(event) =>
                    setInput(
                      event.target
                        .value
                    )
                  }
                  placeholder="Ask Fasal AI about your farm..."
                  rows={1}
                  disabled={loading}
                  onKeyDown={(event) => {
                    if (
                      event.key ===
                        "Enter" &&
                      !event.shiftKey
                    ) {
                      event.preventDefault();

                      void sendMessage();
                    }
                  }}
                />

                <button
                  type="submit"
                  className="send-button"
                  disabled={
                    !input.trim() ||
                    loading
                  }
                  aria-label="Send message"
                >
                  ↑
                </button>
              </div>

              <div className="input-footer">
                <span>
                  ✦ Fasal AI can make
                  mistakes. Verify
                  important farming
                  decisions locally.
                </span>

                <span>
                  Enter ↵ to send
                </span>
              </div>
            </form>
          </section>
        </section>
      </main>
    </>
  );
}