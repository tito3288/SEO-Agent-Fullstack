"use client";

import { useState, useRef } from "react";

export default function SEOAgentUI() {
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      message: "Hello! How can I help you today?",
      timestamp: "1:35 PM",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [csvFiles, setCsvFiles] = useState([]);
  const [csvData, setCsvData] = useState(null);
  const [extractedKeywords, setExtractedKeywords] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setCsvFiles([...csvFiles, file.name]);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split("\n").map((row) => row.split(","));
      setCsvData(rows.slice(0, 5));
    };
    reader.readAsText(file);
  };

  const suggestedQuestions = [
    "How can I improve my SEO rankings?",
    "What are the best practices for internal linking?",
    "How do I optimize my keywords?",
  ];

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = {
      id: chatHistory.length + 1,
      message: message,
      timestamp: "Now",
      sender: "user",
    };

    setChatHistory([...chatHistory, userMessage]);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const result = await response.json();
      if (result.success) {
        const botMessage = {
          id: chatHistory.length + 2,
          message: result.response,
          timestamp: "Now",
          sender: "bot",
        };
        setChatHistory((prev) => [...prev, botMessage]);
      }
    } catch (error) {
      console.error("Chatbot request failed", error);
    }

    setInput("");
  };

  return (
    <div className="w-full h-screen flex text-black p-10 bg-white">
      <div className="w-1/4 bg-white p-4 border border-gray-300 rounded-lg overflow-y-hidden">
        <h2 className="text-lg font-bold mb-4">Chat History</h2>
        {chatHistory.map((chat) => (
          <div
            key={chat.id}
            className={`p-2 border-b border-gray-300 ${
              chat.sender === "user"
                ? "text-white bg-black text-right"
                : "bg-gray-200 text-left"
            } rounded-lg my-1`}
          >
            <p className="text-sm text-gray-500">{chat.timestamp}</p>
            <p className="p-2 inline-block rounded-lg">{chat.message}</p>
          </div>
        ))}
      </div>

      <div className="w-1/2 flex flex-col p-4 bg-white border border-gray-300 rounded-lg mx-4">
        <h2 className="text-lg font-bold mb-4">SEO Agent</h2>
        <div className="p-4 bg-gray-200 rounded-lg mb-4 text-left w-fit">
          Hello! How can I help you today?
        </div>
        <div className="flex flex-col space-y-2 mb-4 w-fit">
          {suggestedQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleSendMessage(question)}
              className="px-4 py-2 bg-white-200 rounded-lg hover:bg-gray-300 text-left w-fit border border-gray-300"
            >
              {question}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-4 mb-4 border-gray-300 rounded-lg">
          {chatHistory.map(
            (chat, index) =>
              index !== 0 && ( // Prevent duplicate first message
                <div
                  key={chat.id}
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
                  >
                    {chat.message}
                  </p>
                </div>
              )
          )}
        </div>
        <div className="flex">
          <input
            type="text"
            className="flex-1 p-2 border border-gray-300 rounded-lg"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            onClick={() => handleSendMessage(input)}
            className="ml-2 bg-blue-500 text-white p-2 rounded-lg"
          >
            Send
          </button>
        </div>
      </div>

      <div className="w-1/4 bg-white p-4 border border-gray-300 rounded-lg overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">CSV Files</h2>
        <input
          type="file"
          accept=".csv"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <label
          className="block text-center bg-blue-500 text-white p-2 rounded-lg cursor-pointer mb-4"
          onClick={() => fileInputRef.current.click()}
        >
          Upload CSV
        </label>

        {csvFiles.map((file, index) => (
          <div
            key={index}
            className="p-2 border-b border-gray-300 cursor-pointer hover:bg-gray-200"
          >
            {file}
          </div>
        ))}
      </div>
    </div>
  );
}
