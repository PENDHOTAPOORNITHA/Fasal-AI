type WeatherData = {
  temperature: number | null;
  humidity: number | null;
  rainfall: number | null;
  condition: string;
  weatherRisk: string;
};

export async function getWeatherContext(
  district: string
): Promise<WeatherData> {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey || !district) {
    return {
      temperature: null,
      humidity: null,
      rainfall: null,
      condition: "Weather data unavailable",
      weatherRisk: "Unknown",
    };
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        district
      )},IN&units=metric&appid=${apiKey}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Weather request failed");
    }

    const data = await response.json();

    const temperature =
      typeof data.main?.temp === "number"
        ? Math.round(data.main.temp)
        : null;

    const humidity =
      typeof data.main?.humidity === "number"
        ? data.main.humidity
        : null;

    const rainfall =
      typeof data.rain?.["1h"] === "number"
        ? data.rain["1h"]
        : typeof data.rain?.["3h"] === "number"
        ? data.rain["3h"]
        : 0;

    let weatherRisk = "Low";

    if (
      (humidity !== null && humidity >= 85) ||
      rainfall > 10
    ) {
      weatherRisk = "High";
    } else if (
      (humidity !== null && humidity >= 70) ||
      rainfall > 2 ||
      (temperature !== null && temperature >= 38)
    ) {
      weatherRisk = "Moderate";
    }

    return {
      temperature,
      humidity,
      rainfall,
      condition:
        data.weather?.[0]?.description ||
        "Current weather conditions",
      weatherRisk,
    };
  } catch {
    return {
      temperature: null,
      humidity: null,
      rainfall: null,
      condition: "Weather data unavailable",
      weatherRisk: "Unknown",
    };
  }
}