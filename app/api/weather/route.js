export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  const apiKey = process.env.OPENWEATHER_API_KEY;

  let locationUrl = "";
  if (lat && lon) {
    locationUrl = `lat=${lat}&lon=${lon}`;
  } else if (city) {
    locationUrl = `q=${city}`;
  } else {
    return Response.json({ error: "Missing parameters" }, { status: 400 });
  }

  // Current weather
  const currentRes = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?${locationUrl}&appid=${apiKey}&units=metric`
  );
  const currentData = await currentRes.json();

  // Forecast
  const forecastRes = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?${locationUrl}&appid=${apiKey}&units=metric`
  );
  const forecastData = await forecastRes.json();

  return Response.json({
    current: currentData,
    forecast: forecastData,
  });
}
