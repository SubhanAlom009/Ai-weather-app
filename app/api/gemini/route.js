import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { message, weatherData } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      console.error("Gemini API key not found");
      return Response.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Create a weather-focused prompt
    const prompt = `
You are a helpful weather assistant. Answer questions about weather using the following current weather data:

${
  weatherData
    ? `
Current Weather Information:
- Location: ${weatherData.name || "Unknown"}
- Temperature: ${
        weatherData.main?.temp
          ? Math.round(weatherData.main.temp) + "°C"
          : "N/A"
      }
- Feels Like: ${
        weatherData.main?.feels_like
          ? Math.round(weatherData.main.feels_like) + "°C"
          : "N/A"
      }
- Weather: ${weatherData.weather?.[0]?.description || "N/A"}
- Humidity: ${weatherData.main?.humidity || "N/A"}%
- Wind Speed: ${weatherData.wind?.speed || "N/A"} m/s
- Pressure: ${weatherData.main?.pressure || "N/A"} hPa
`
    : "No current weather data available"
}

User question: ${message}

Please provide a helpful, conversational response about the weather. Keep it concise and friendly. Use emojis when appropriate.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return Response.json({ message: text });
  } catch (error) {
    console.error("Gemini API error:", error);

    let errorMessage = "Failed to get response from AI";

    if (error.message?.includes("API_KEY")) {
      errorMessage = "Invalid API key";
    } else if (error.message?.includes("quota")) {
      errorMessage = "API quota exceeded";
    } else if (error.message?.includes("SAFETY")) {
      errorMessage = "Content filtered by safety settings";
    }

    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
