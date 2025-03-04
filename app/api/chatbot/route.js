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

    // Simulate thinking message
    const thinkingResponse = {
      success: true,
      response: "Let me think...",
    };

    setTimeout(() => {
      return NextResponse.json(thinkingResponse);
    }, 500); // Small delay to simulate "thinking"

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
                "You are an SEO expert providing guidance on keyword optimization, internal linking, and on-page SEO. Format responses properly with bullet points, numbers, and spacing for readability.",
            },
            { role: "user", content: message },
          ],
        }),
      }
    );

    const data = await openAIResponse.json();
    const formattedResponse = data.choices[0].message.content.replace(
      /\n/g,
      "<br>"
    ); // ✅ Proper formatting with line breaks

    return NextResponse.json({
      success: true,
      response: formattedResponse,
    });
  } catch (error) {
    console.error("❌ Chatbot API Error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch chatbot response",
    });
  }
}
