"use client"; // ✅ Add this at the top!

import SEOAgent from "../components/SeoAgent";
import UploadCSV from "../components/UploadFileCSV";
import ChatHistory from "../components/ChatHistory";

export default function SEOAgentUI() {
  return (
    <div className="w-full h-screen flex text-black p-10 bg-white">
      <ChatHistory />
      <SEOAgent />
      <UploadCSV />
    </div>
  );
}
