export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");

  const apiKey = process.env.OPENWEATHER_API_KEY;
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
  );

  const data = await response.json();
  return Response.json(data);
}
