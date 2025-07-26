"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import WeatherChatbot from "@/components/WeatherChatbot";

// Utility: Change background based on weather condition
function getWeatherBackground(condition) {
  console.log("Weather condition:", condition); // Debugging

  if (!condition) return "from-blue-200 to-purple-300";
  switch (condition.toLowerCase()) {
    case "clear":
      return "from-yellow-200 to-orange-300";
    case "clouds":
      return "from-gray-300 to-gray-500";
    case "haze":
      return "from-zinc-100 to-zinc-300";
    case "rain":
    case "drizzle":
      return "from-blue-400 to-gray-600";
    case "thunderstorm":
      return "from-purple-700 to-gray-900";
    case "snow":
      return "from-blue-100 to-white";
    case "mist":
    case "fog":
      return "from-gray-200 to-gray-400";
    default:
      return "from-blue-200 to-purple-300";
  }
}

// Simple spinner
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-[50vh]">
    <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function Home() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true); // set to true initially

  const bgGradient = weather
    ? getWeatherBackground(weather.weather[0].main)
    : "from-blue-200 to-purple-300";

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
      className={`min-h-screen bg-gradient-to-br ${bgGradient} p-6 transition-colors duration-500 flex flex-col items-center text-white`}
    >
      {/* Header */}
      <h1 className="text-5xl font-extrabold mb-6 text-center drop-shadow-lg">
        🌤️ AI Weather App
      </h1>

      {/* Loading Spinner */}
      {loading && <LoadingSpinner />}

      {/* Weather Info */}
      {!loading && weather && weather.main && (
        <div className="bg-white/20 backdrop-blur-md p-6 rounded-2xl shadow-2xl text-center w-full max-w-md mb-8 transition hover:scale-105 duration-300">
          <h2 className="text-3xl font-semibold">{weather.name}</h2>
          <Image
            width={80}
            height={80}
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`}
            alt="weather icon"
            className="mx-auto my-2"
          />
          <p className="capitalize text-lg">{weather.weather[0].description}</p>
          <p className="text-4xl font-bold mt-2">
            {Math.round(weather.main.temp)}°C
          </p>
        </div>
      )}

      {/* Search Box */}
      <div className="flex items-center gap-2 justify-center w-full max-w-md mb-10">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Search city..."
          className="w-full px-4 py-2 rounded-lg border border-white/30 bg-white/10 text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-white"
        />
        <button
          onClick={getWeatherByCity}
          className="bg-white/30 hover:bg-white/40 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          {loading ? "..." : "Go"}
        </button>
      </div>

      {/* Hourly Forecast */}
      {!loading && forecast.length > 0 && (
        <div className="w-full max-w-5xl mb-10 mx-auto">
          <h3 className="text-xl font-bold mb-4 text-center">Next Few Hours</h3>
          <div className="w-full overflow-x-auto">
            <div className="flex justify-center space-x-4 pb-2 px-1 w-fit mx-auto min-w-full">
              {forecast.slice(0, 8).map((item, index) => (
                <div
                  key={index}
                  className="bg-white/20 backdrop-blur-md rounded-lg p-4 min-w-[100px] text-center shadow-md"
                >
                  <p className="text-sm font-medium">
                    {new Date(item.dt * 1000).getHours()}:00
                  </p>
                  <Image
                    width={40}
                    height={40}
                    src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                    alt="hourly icon"
                    className="mx-auto"
                  />
                  <p className="font-bold">{Math.round(item.main.temp)}°C</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5-Day Forecast */}
      {!loading && forecast.length > 0 && (
        <div className="w-full max-w-5xl mb-6">
          <h3 className="text-xl font-bold mb-4 text-center">5-Day Forecast</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 px-2">
            {forecast
              .filter((_, i) => i % 8 === 0)
              .map((item, index) => (
                <div
                  key={index}
                  className="bg-white/20 backdrop-blur-md p-4 rounded-xl text-center shadow-md"
                >
                  <p className="text-sm font-medium">
                    {new Date(item.dt * 1000).toLocaleDateString("en-US", {
                      weekday: "short",
                    })}
                  </p>
                  <Image
                    width={40}
                    height={40}
                    src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                    alt="daily icon"
                    className="mx-auto"
                  />
                  <p className="text-lg font-bold">
                    {Math.round(item.main.temp)}°C
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      <p className="text-xs text-white/70">Powered by OpenWeatherMap</p>
      <WeatherChatbot weatherData={weather} />
    </div>
  );
}
