"use client"; // ✅ Add this at the top!

import { useState, useRef } from "react";

export default function SEOAgent() {
  const [chatHistory, setChatHistory] = useState([
    { id: 1, message: "Hello! How can I help you today?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const typingIntervalRef = useRef(null);

  const suggestedQuestions = [
    "How can I improve my SEO rankings?",
    "What are the best practices for internal linking?",
    "How do I optimize my keywords?",
  ];

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;
    if (isProcessing) return; // Prevent multiple active queries at once.

    setIsProcessing(true);
    setInput(""); // ✅ Clear input field

    const userMessage = {
      id: Date.now(), // Ensure unique ID
      message: message,
      sender: "user",
    };

    setChatHistory((prev) => [
      ...prev,
      userMessage,
      {
        id: "thinking",
        message: "Let me think...",
        sender: "bot",
      },
    ]);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const result = await response.json();
      if (result.success) {
        simulateTyping(result.response);
      }
    } catch (error) {
      console.error("Chatbot request failed", error);
      setChatHistory((prev) =>
        prev.map((msg) =>
          msg.id === "thinking"
            ? { ...msg, message: "Error fetching response." }
            : msg
        )
      );
    }
  };

  const simulateTyping = (fullMessage) => {
    let index = 0;
    setChatHistory((prev) =>
      prev.map((msg) => (msg.id === "thinking" ? { ...msg, message: "" } : msg))
    );

    typingIntervalRef.current = setInterval(() => {
      setChatHistory((prev) =>
        prev.map((msg) =>
          msg.id === "thinking"
            ? { ...msg, message: fullMessage.slice(0, index + 1) }
            : msg
        )
      );

      index++;
      if (index >= fullMessage.length) {
        clearInterval(typingIntervalRef.current);
        setChatHistory((prev) =>
          prev.map((msg) =>
            msg.id === "thinking" ? { ...msg, id: prev.length + 1 } : msg
          )
        );
        setIsProcessing(false);
      }
    }, 20);
  };

  const stopTyping = () => {
    clearInterval(typingIntervalRef.current);
    setChatHistory((prev) =>
      prev.map((msg) =>
        msg.id === "thinking"
          ? { ...msg, id: Date.now(), message: msg.message.trim() }
          : msg
      )
    );
    setIsProcessing(false);
  };

  return (
    <div className="w-1/2 flex flex-col p-4 bg-white border border-gray-300 rounded-lg mx-4">
      <h2 className="text-lg font-bold mb-4">SEO Agent</h2>

      <div className="flex flex-col space-y-2 mb-4 w-fit">
        {suggestedQuestions.map((question, index) => (
          <button
            key={index}
            onClick={() => handleSendMessage(question)}
            className="px-4 py-2 bg-white rounded-lg hover:bg-gray-300 text-left w-fit border border-gray-300"
            disabled={isProcessing}
          >
            {question}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-4 mb-4 rounded-lg">
        {chatHistory.map((chat, index) => (
          <div
            key={`${chat.id}-${index}`} // Ensure each chat message has a unique key
            className={`mb-2 flex ${
              chat.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <p
              className={`p-2 rounded-lg inline-block ${
                chat.sender === "user"
                  ? "bg-black text-white"
                  : "bg-gray-200 text-black"
              }`}
              dangerouslySetInnerHTML={{
                __html: chat.message.replace(/\n/g, "<br>"),
              }}
            ></p>
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          className="flex-1 p-2 border border-gray-300 rounded-lg"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage(input); // ✅ Pressing Enter submits the message
          }}
          disabled={isProcessing}
        />
        {isProcessing ? (
          <button
            onClick={stopTyping}
            className="ml-2 bg-red-500 text-white p-2 rounded-lg"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={() => handleSendMessage(input)}
            className="ml-2 bg-blue-500 text-white p-2 rounded-lg"
          >
            Send
          </button>
        )}
      </div>
    </div>
  );
}
