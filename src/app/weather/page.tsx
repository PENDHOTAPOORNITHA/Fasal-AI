"use client";

import {
  useEffect,
  useState,
} from "react";

import FasalNavbar from "@/components/FasalNavbar";

import {
  Cloud,
  Droplets,
  Leaf,
  MapPin,
  RefreshCw,
  Thermometer,
  Umbrella,
  AlertTriangle,
  Sprout,
} from "lucide-react";

import "./weather.css";

type WeatherData = {
  temperature: number | null;
  humidity: number | null;
  rainfall: number | null;
  condition: string;
  weatherRisk: string;
};

export default function WeatherPage() {
  const [city, setCity] =
    useState("Hyderabad");

  const [searchCity, setSearchCity] =
    useState("Hyderabad");

  const [weather, setWeather] =
    useState<WeatherData | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchWeather = async (
    district: string
  ) => {
    setLoading(true);
    setError("");

    try {
      const response =
        await fetch(
          `/api/weather?district=${encodeURIComponent(
            district
          )}`,
          {
            cache: "no-store",
          }
        );

      if (!response.ok) {
        throw new Error(
          "Weather request failed"
        );
      }

      const data =
        await response.json();

      if (
        !data.success ||
        !data.weather
      ) {
        throw new Error(
          "Weather data unavailable"
        );
      }

      setWeather(
        data.weather
      );

      setCity(district);
    } catch {
      setError(
        "Unable to load weather data. Please try again."
      );

      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function loadInitialWeather() {
      await Promise.resolve();

      if (cancelled) {
        return;
      }

      await fetchWeather(
        "Hyderabad"
      );
    }

    void loadInitialWeather();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    const value =
      searchCity.trim();

    if (!value) {
      return;
    }

    void fetchWeather(value);
  };

  const getRiskClass = () => {
    if (!weather) {
      return "risk-low";
    }

    if (
      weather.weatherRisk ===
      "High"
    ) {
      return "risk-high";
    }

    if (
      weather.weatherRisk ===
      "Moderate"
    ) {
      return "risk-moderate";
    }

    return "risk-low";
  };

  const getRiskMessage = () => {
    if (!weather) {
      return "";
    }

    if (
      weather.weatherRisk ===
      "High"
    ) {
      return "Weather conditions may create higher risks for irrigation, crop disease, or field activities. Monitor your crops closely.";
    }

    if (
      weather.weatherRisk ===
      "Moderate"
    ) {
      return "Some weather conditions may affect farming activities. Keep an eye on rainfall, humidity and temperature.";
    }

    return "Current weather conditions show relatively low risk for your crops and regular farm activities.";
  };

  const conditionText =
    weather?.condition?.trim() ||
    "Current conditions";

  return (
    <>
      <FasalNavbar />

      <main className="weather-page">
        <section className="weather-hero">
          <div className="weather-hero-content">
            <p className="eyebrow">
              FARM WEATHER INTELLIGENCE
            </p>

            <h1>
              Weather that helps you
              <br />
              <span>
                farm smarter.
              </span>
            </h1>

            <p className="hero-description">
              Get current weather
              conditions and practical
              farming insights for your
              location. Fasal AI turns
              weather data into useful
              decisions for your crops.
            </p>
          </div>

          <form
            className="location-box"
            onSubmit={handleSearch}
          >
            <MapPin size={19} />

            <input
              type="text"
              value={searchCity}
              onChange={(event) =>
                setSearchCity(
                  event.target.value
                )
              }
              placeholder="Enter district or city"
              aria-label="Enter district or city"
            />

            <button
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <RefreshCw
                  size={16}
                  className="spin"
                />
              ) : (
                "Check"
              )}
            </button>
          </form>
        </section>

        {error && (
          <div className="weather-error">
            <div className="weather-error-content">
              <AlertTriangle size={20} />

              <p>
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void fetchWeather(
                  city
                )
              }
            >
              Try Again
            </button>
          </div>
        )}

        {loading && !weather ? (
          <div className="weather-loading">
            <RefreshCw
              size={30}
              className="spin"
            />

            <p>
              Loading current weather...
            </p>
          </div>
        ) : weather ? (
          <>
            <section className="current-weather">
              <div className="current-main">
                <div className="weather-icon">
                  <Cloud
                    size={48}
                    strokeWidth={1.4}
                  />
                </div>

                <div className="current-weather-info">
                  <p className="location-label">
                    <MapPin size={14} />
                    {city}
                  </p>

                  <div className="temperature">
                    {weather.temperature !==
                    null
                      ? `${weather.temperature}°C`
                      : "--"}
                  </div>

                  <p className="condition">
                    {conditionText}
                  </p>
                </div>
              </div>

              <div
                className={`weather-risk ${getRiskClass()}`}
              >
                <AlertTriangle size={20} />

                <div>
                  <span>
                    Weather Risk
                  </span>

                  <strong>
                    {
                      weather.weatherRisk
                    }
                  </strong>
                </div>
              </div>
            </section>

            <section className="weather-stats">
              <div className="weather-stat">
                <div className="stat-icon">
                  <Droplets size={21} />
                </div>

                <div className="stat-content">
                  <span>
                    Humidity
                  </span>

                  <strong>
                    {weather.humidity !==
                    null
                      ? `${weather.humidity}%`
                      : "--"}
                  </strong>
                </div>
              </div>

              <div className="weather-stat">
                <div className="stat-icon">
                  <Umbrella size={21} />
                </div>

                <div className="stat-content">
                  <span>
                    Rainfall
                  </span>

                  <strong>
                    {weather.rainfall !==
                    null
                      ? `${weather.rainfall} mm`
                      : "--"}
                  </strong>
                </div>
              </div>

              <div className="weather-stat">
                <div className="stat-icon">
                  <Thermometer size={21} />
                </div>

                <div className="stat-content">
                  <span>
                    Temperature
                  </span>

                  <strong>
                    {weather.temperature !==
                    null
                      ? `${weather.temperature}°C`
                      : "--"}
                  </strong>
                </div>
              </div>

              <div className="weather-stat">
                <div className="stat-icon">
                  <Cloud size={21} />
                </div>

                <div className="stat-content condition-content">
                  <span>
                    Condition
                  </span>

                  <strong
                    className="condition-stat"
                    title={
                      conditionText
                    }
                  >
                    {conditionText}
                  </strong>
                </div>
              </div>
            </section>

            <section className="risk-section">
              <div className="risk-banner">
                <div className="risk-banner-icon">
                  <AlertTriangle size={25} />
                </div>

                <div className="risk-banner-content">
                  <p className="eyebrow">
                    WEATHER ALERT
                  </p>

                  <h3>
                    Current weather risk:{" "}
                    {
                      weather.weatherRisk
                    }
                  </h3>

                  <p>
                    {getRiskMessage()}
                  </p>
                </div>
              </div>
            </section>

            <section className="farm-insights">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">
                    FARM INTELLIGENCE
                  </p>

                  <h2>
                    What this means for your{" "}
                    <span>
                      farm
                    </span>
                  </h2>
                </div>
              </div>

              <div className="insight-grid">
                <div className="insight-card">
                  <div className="insight-icon">
                    <Droplets size={23} />
                  </div>

                  <div>
                    <h3>
                      Irrigation
                    </h3>

                    <p>
                      {weather.rainfall !==
                        null &&
                      weather.rainfall >
                        2
                        ? "Recent rainfall may reduce the need for immediate irrigation. Check soil moisture before watering."
                        : "Current conditions are suitable for your regular irrigation schedule."}
                    </p>
                  </div>
                </div>

                <div className="insight-card">
                  <div className="insight-icon">
                    <Leaf size={23} />
                  </div>

                  <div>
                    <h3>
                      Crop Protection
                    </h3>

                    <p>
                      {weather.humidity !==
                        null &&
                      weather.humidity >=
                        80
                        ? "High humidity can increase disease pressure. Inspect leaves and monitor crops closely."
                        : "Weather conditions currently show relatively low risk for your crops."}
                    </p>
                  </div>
                </div>

                <div className="insight-card">
                  <div className="insight-icon">
                    <Thermometer size={23} />
                  </div>

                  <div>
                    <h3>
                      Temperature
                    </h3>

                    <p>
                      {weather.temperature !==
                        null &&
                      weather.temperature >=
                        38
                        ? "High temperatures can increase crop water demand. Monitor soil moisture and plant stress."
                        : "Temperature conditions are currently within a manageable range for regular farm activities."}
                    </p>
                  </div>
                </div>

                <div className="insight-card">
                  <div className="insight-icon">
                    <Sprout size={23} />
                  </div>

                  <div>
                    <h3>
                      Field Activity
                    </h3>

                    <p>
                      {weather.weatherRisk ===
                      "High"
                        ? "Consider delaying non-essential field activities until conditions become safer."
                        : "Current conditions are suitable for normal farm monitoring and routine field activities."}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : null}
      </main>
    </>
  );
}