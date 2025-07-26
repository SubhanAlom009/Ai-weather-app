"use client";
import { useState } from "react";

export default function Home() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  const getWeather = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/weather?city=${city}`);
      const data = await res.json();
      setWeather(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 to-purple-300 flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-6">☀️ AI Weather App</h1>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city"
          className="px-4 py-2 rounded border text-black"
        />
        <button
          onClick={getWeather}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Loading..." : "Get Weather"}
        </button>
      </div>

      {weather && weather.main && (
        <div className="mt-8 bg-white p-6 rounded shadow text-center">
          <h2 className="text-2xl font-semibold">{weather.name}</h2>
          <p className="text-lg">{weather.weather[0].description}</p>
          <p className="text-4xl mt-2">{Math.round(weather.main.temp)}°C</p>
        </div>
      )}
    </div>
  );
}
