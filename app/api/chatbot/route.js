import "dotenv/config";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({
        success: false,
        error: "Message is required",
      });
    }

    // ✅ Check if the message is a common phrase and return a short response
    const lowerMessage = message.toLowerCase().trim();
    if (shortResponses[lowerMessage]) {
      return NextResponse.json({
        success: true,
        response: shortResponses[lowerMessage],
      });
    }

    // ✅ If no short response exists, send the request to OpenAI
    const openAIResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content:
                "You are an SEO expert providing guidance on keyword optimization, internal linking, and on-page SEO.",
            },
            { role: "user", content: message },
          ],
        }),
      }
    );

    const data = await openAIResponse.json();
    return NextResponse.json({
      success: true,
      response: data.choices[0].message.content,
    });
  } catch (error) {
    console.error("❌ Chatbot API Error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch chatbot response",
    });
  }
}

const shortResponses = {
  "thank you": "You're welcome! 😊",
  thanks: "No problem! Happy to help. 👍",
  hello: "Hello there! How can I assist you today?",
  hi: "Hey! Need help with SEO?",
  "how are you": "I'm just a chatbot, but I'm here to help!",
  awesome: "Glad to hear that! 🚀",
};
