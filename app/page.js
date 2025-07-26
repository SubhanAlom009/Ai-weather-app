"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import WeatherChatbot from "@/components/WeatherChatbot";

// Utility: Change background based on weather condition with better contrast
function getWeatherBackground(condition) {
  if (!condition) return "from-slate-100 via-blue-50 to-indigo-100";

  switch (condition.toLowerCase()) {
    case "clear":
      return "from-amber-100 via-yellow-50 to-orange-100";
    case "clouds":
      return "from-gray-200 via-slate-100 to-zinc-200";
    case "haze":
      return "from-yellow-100 via-amber-50 to-orange-100";
    case "rain":
    case "drizzle":
      return "from-blue-200 via-slate-100 to-gray-200";
    case "thunderstorm":
      return "from-slate-300 via-gray-200 to-zinc-300";
    case "snow":
      return "from-blue-50 via-white to-slate-100";
    case "mist":
    case "fog":
      return "from-gray-100 via-slate-50 to-zinc-100";
    default:
      return "from-slate-100 via-blue-50 to-indigo-100";
  }
}

// Get theme colors as inline styles to avoid Tailwind JIT issues
function getThemeColors(condition) {
  const themes = {
    clear: {
      text: "#92400e", // amber-800
      textLight: "#d97706", // amber-600
      border: "#f59e0b", // amber-500
      button: "#d97706", // amber-600
      buttonHover: "#92400e", // amber-800
    },
    clouds: {
      text: "#334155", // slate-700
      textLight: "#64748b", // slate-500
      border: "#64748b", // slate-500
      button: "#475569", // slate-600
      buttonHover: "#334155", // slate-700
    },
    haze: {
      text: "#ca8a04", // yellow-600
      textLight: "#eab308", // yellow-500
      border: "#eab308", // yellow-500
      button: "#ca8a04", // yellow-600
      buttonHover: "#a16207", // yellow-700
    },
    rain: {
      text: "#1e3a8a", // blue-800
      textLight: "#3b82f6", // blue-500
      border: "#3b82f6", // blue-500
      button: "#2563eb", // blue-600
      buttonHover: "#1d4ed8", // blue-700
    },
    drizzle: {
      text: "#1e3a8a", // blue-800
      textLight: "#3b82f6", // blue-500
      border: "#3b82f6", // blue-500
      button: "#2563eb", // blue-600
      buttonHover: "#1d4ed8", // blue-700
    },
    thunderstorm: {
      text: "#1f2937", // gray-800
      textLight: "#6b7280", // gray-500
      border: "#6b7280", // gray-500
      button: "#4b5563", // gray-600
      buttonHover: "#374151", // gray-700
    },
    snow: {
      text: "#334155", // slate-700
      textLight: "#64748b", // slate-500
      border: "#64748b", // slate-500
      button: "#2563eb", // blue-600
      buttonHover: "#1d4ed8", // blue-700
    },
    mist: {
      text: "#1f2937", // gray-800
      textLight: "#6b7280", // gray-500
      border: "#6b7280", // gray-500
      button: "#4b5563", // gray-600
      buttonHover: "#374151", // gray-700
    },
    fog: {
      text: "#1f2937", // gray-800
      textLight: "#6b7280", // gray-500
      border: "#6b7280", // gray-500
      button: "#4b5563", // gray-600
      buttonHover: "#374151", // gray-700
    },
  };

  return themes[condition?.toLowerCase()] || themes.clouds;
}

// Enhanced spinner
const LoadingSpinner = ({ colors }) => (
  <div className="flex justify-center items-center min-h-[50vh]">
    <div
      className="w-12 h-12 border-4 rounded-full animate-spin drop-shadow-md"
      style={{
        borderColor: colors.textLight + "40", // Add transparency
        borderTopColor: colors.button,
      }}
    />
  </div>
);

export default function Home() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);

  const bgGradient = weather
    ? getWeatherBackground(weather.weather[0].main)
    : "from-slate-100 via-blue-50 to-indigo-100";

  const themeColors = weather
    ? getThemeColors(weather.weather[0].main)
    : getThemeColors(null);

  // Fetch weather by coordinates
  const getWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      const data = await res.json();
      setWeather(data.current);
      setForecast(data.forecast.list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch weather by city name
  const getWeatherByCity = async () => {
    if (!city) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/weather?city=${city}`);
      const data = await res.json();
      setWeather(data.current);
      setForecast(data.forecast.list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // On mount: get geolocation
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          getWeatherByCoords(latitude, longitude);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${bgGradient} p-6 pb-24 transition-all duration-700 flex flex-col items-center text-shadow-lg`}
      style={{ color: themeColors.text }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold mb-2 tracking-wide text-shadow-lg">
          🌤️ Weather AI
        </h1>
        <p className="text-sm opacity-70 font-medium">
          Real-time forecasts powered by AI
        </p>
      </div>

      {/* Loading Spinner */}
      {loading && <LoadingSpinner colors={themeColors} />}

      {/* Main Weather Card */}
      {!loading && weather && weather.main && (
        <div className="bg-white/70 backdrop-blur-lg border border-white/40 p-8 rounded-3xl shadow-2xl text-center w-full max-w-sm mb-8 transition-all duration-300 hover:bg-white/80 hover:shadow-3xl">
          <h2
            className="text-3xl font-bold mb-4 tracking-wide"
            style={{ color: themeColors.text }}
          >
            {weather.name}
          </h2>
          <Image
            width={100}
            height={100}
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt="weather icon"
            className="mx-auto mb-4 drop-shadow-lg"
          />
          <p
            className="capitalize text-lg mb-4 font-medium"
            style={{ color: themeColors.textLight }}
          >
            {weather.weather[0].description}
          </p>
          <p
            className="text-6xl font-bold mb-2"
            style={{ color: themeColors.text }}
          >
            {Math.round(weather.main.temp)}°
          </p>
          <p
            className="text-sm opacity-80"
            style={{ color: themeColors.textLight }}
          >
            Feels like {Math.round(weather.main.feels_like)}°C
          </p>
        </div>
      )}

      {/* Search Box */}
      <div className="flex items-center gap-3 justify-center w-full max-w-md mb-12">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && getWeatherByCity()}
          placeholder="Search city..."
          className="w-full px-4 py-3 rounded-xl bg-white/60 backdrop-blur-sm outline-none focus:ring-2 focus:border-transparent transition-all font-medium shadow-lg"
          style={{
            borderColor: themeColors.border,
            color: themeColors.text,
            borderWidth: "1px",
            focusRingColor: themeColors.border,
          }}
        />
        <button
          onClick={getWeatherByCity}
          className="text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-xl min-w-[60px] shadow-lg"
          style={{
            backgroundColor: themeColors.button,
          }}
          onMouseEnter={(e) =>
            (e.target.style.backgroundColor = themeColors.buttonHover)
          }
          onMouseLeave={(e) =>
            (e.target.style.backgroundColor = themeColors.button)
          }
        >
          {loading ? "..." : "Go"}
        </button>
      </div>

      {/* Hourly Forecast */}
      {!loading && forecast.length > 0 && (
        <div className="w-full max-w-6xl mb-12">
          <h3
            className="text-2xl font-bold mb-6 text-center drop-shadow-md"
            style={{ color: themeColors.text }}
          >
            Next 24 Hours
          </h3>
          <div className="w-full overflow-x-auto">
            <div className="flex justify-center space-x-4 pb-4 px-2">
              {forecast.slice(0, 8).map((item, index) => (
                <div
                  key={index}
                  className="bg-white/60 backdrop-blur-lg border border-white/30 rounded-2xl p-4 min-w-[110px] text-center shadow-lg hover:bg-white/70 transition-all"
                  style={{ color: themeColors.text }}
                >
                  <p className="text-sm font-semibold opacity-80 mb-2">
                    {new Date(item.dt * 1000).getHours()}:00
                  </p>
                  <Image
                    width={40}
                    height={40}
                    src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                    alt="hourly icon"
                    className="mx-auto mb-2 drop-shadow-sm"
                  />
                  <p className="font-bold text-lg">
                    {Math.round(item.main.temp)}°
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5-Day Forecast */}
      {!loading && forecast.length > 0 && (
        <div className="w-full max-w-4xl mb-8">
          <h3
            className="text-2xl font-bold mb-6 text-center drop-shadow-md"
            style={{ color: themeColors.text }}
          >
            5-Day Forecast
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {forecast
              .filter((_, i) => i % 8 === 0)
              .map((item, index) => (
                <div
                  key={index}
                  className="bg-white/60 backdrop-blur-lg border border-white/30 p-5 rounded-2xl text-center shadow-lg hover:bg-white/70 transition-all"
                  style={{ color: themeColors.text }}
                >
                  <p className="text-sm font-semibold opacity-80 mb-3">
                    {new Date(item.dt * 1000).toLocaleDateString("en-US", {
                      weekday: "short",
                    })}
                  </p>
                  <Image
                    width={40}
                    height={40}
                    src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                    alt="daily icon"
                    className="mx-auto mb-3 drop-shadow-sm"
                  />
                  <p className="font-bold text-xl">
                    {Math.round(item.main.temp)}°
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      <p
        className="text-xs opacity-60 font-medium mb-20"
        style={{ color: themeColors.textLight }}
      >
        Powered by OpenWeatherMap
      </p>

      {/* Fixed Weather Chatbot - Always bottom right */}
      <WeatherChatbot weatherData={weather} />
    </div>
  );
}
