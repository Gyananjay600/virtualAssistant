import axios from "axios"
import dotenv from "dotenv"
dotenv.config()

const geminiResponse = async (command, assistantName = "Assistant", userName = "User") => {
  const prompt = `You are a virtual assistant named ${assistantName} created by ${userName}. 
You are not Google. You will now behave like a voice-enabled assistant.

Your task is to understand the user's natural language input and respond with a JSON object like this:

{
  "type": "general" | "google-search" | "youtube-search" | "youtube-play" | "get-time" | "get-date" | "get-day" | "get-month" | "calculator-open" | "instagram-open" | "facebook-open" | "weather-show",
  "userInput": "<original user input>" {only remove your name from userinput if exists and if user asked to search something on google or youtube, put only the search query in userInput},
  "response": "<a short spoken response to read out loud to the user>"
}

Instructions:
- "type": determine the intent of the user.
- "userInput": original sentence the user spoke or search query.
- "response": A short voice-friendly reply, e.g., "Sure, playing it now", "Here's what I found", "Today is Tuesday", etc.

Type meanings:
- "general": if it's a factual or informational question. Provide a short, direct answer.
- "google-search": if user wants to search something on Google.
- "youtube-search": if user wants to search something on YouTube.
- "youtube-play": if user wants to directly play a video or song.
- "calculator-open": if user wants to open a calculator.
- "instagram-open": if user wants to open instagram.
- "facebook-open": if user wants to open facebook.
- "weather-show": if user wants to know weather.
- "get-time": if user asks for current time.
- "get-date": if user asks for today's date.
- "get-day": if user asks what day it is.
- "get-month": if user asks for the current month.

Important:
- If someone asks who created or made you, mention ${userName}.
- Only respond with the JSON object, nothing else.

now your userInput: ${command}
`;

  // Fallback models to ensure 100% availability even during Google service demand spikes
  const fallbackModels = [
    "gemini-3.1-flash-lite",
    "gemini-flash-lite-latest",
    "gemini-3.8-flash",
    "gemini-flash-latest",
    "gemini-3.5-flash"
  ];

  const defaultUrl = process.env.GEMINI_API_URL || "";
  let apiKey = "";
  if (defaultUrl.includes("key=")) {
    apiKey = defaultUrl.split("key=")[1];
  }

  for (const model of fallbackModels) {
    try {
      const url = apiKey
        ? `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
        : defaultUrl;

      const result = await axios.post(url, {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      }, { timeout: 15000 });

      const text = result?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return text;
      }
    } catch (err) {
      console.warn(`Gemini model ${model} attempt failed (${err.response?.status || err.message}), trying next...`);
    }
  }

  // Graceful fallback JSON if API is completely unavailable
  return JSON.stringify({
    type: "general",
    userInput: command,
    response: `I'm ${assistantName}. How can I assist you?`
  });
}

export default geminiResponse