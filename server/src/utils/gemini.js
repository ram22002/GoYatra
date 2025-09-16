const { GoogleGenerativeAI } = require("@google/generative-ai");

if (!process.env.GOOGLE_API_KEY) {
  console.error("Error: GOOGLE_API_KEY is not set.");
  throw new Error("Missing GOOGLE_API_KEY");
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const GEMINI_MODEL = "gemini-1.5-flash";

async function chatWithGemini(message) {
  try {
    if (!message || typeof message !== "string" || !message.trim()) {
      throw new Error("Invalid input message. It must be a non-empty string.");
    }

    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const prompt = [
      {
        role: "user",
        parts: [
          {
            text: `
You are "GoYatra Assistant", a friendly AI support agent for the travel website GoYatra.

📝 ALWAYS respond in **valid JSON** like this:
{
  "action": "navigate" | "setTheme" | "showInfo" | "showWeather",
  "target": "<optional - route or theme>",
  "message": "Response to show user"
}

📌 Rules about GoYatra:
- Flights are under development. Tell users that if they ask about flights.
- Hotel and package bookings are available.
- Weather is shown in the "Itinerary" section.
- To reset password, email support@goyatra.com
- Refunds take 5-7 days
- Users can manage bookings in their profile section.

📌 Action Examples:
- If user says "plan a trip to Norway" → 
  {"action":"navigate","target":"/travel-prefrence","message":"Let's plan your Norway trip!"}

- If user says "enable dark mode" → 
  {"action":"setTheme","target":"dark","message":"Dark mode enabled 🌙"}

- If user asks for weather → 
  {"action":"showWeather","message":"Weather info is available in your itinerary section."}

❗ If unrelated to travel, return:
{"action":"showInfo","message":"I'm your travel support assistant! Ask me about bookings, payments, cancellations, or travel help."}

User: ${message}
`.trim(),
          },
        ],
      },
    ];

    const result = await model.generateContent({ contents: prompt });
    const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text;

    try {
      return JSON.parse(text);
    } catch {
      return {
        action: "showInfo",
        message: "I'm here to help with your travel plans! Can you clarify your request?",
      };
    }
  } catch (error) {
    console.error("Gemini error:", error.message || error);
    return {
      action: "showInfo",
      message: "Sorry, I'm unable to respond right now. Please try again later.",
    };
  }
}

module.exports = chatWithGemini;
