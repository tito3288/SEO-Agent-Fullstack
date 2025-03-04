"use client"; // ✅ Required for hooks in Next.js App Router

import { useState, useRef } from "react";

export default function UploadCSV() {
  const [csvFiles, setCsvFiles] = useState([]);
  const [file, setFile] = useState(null);
  const [lowHangingFruit, setLowHangingFruit] = useState([]);
  const [showExtractButton, setShowExtractButton] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setCsvFiles([...csvFiles, selectedFile.name]);
    setShowExtractButton(true); // ✅ Show "Extract Low-Hanging Fruit" button after upload
  };

  const handleExtractKeywords = async () => {
    if (!file) return alert("Please upload a CSV file first.");

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/extract", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    if (result.success) {
      setLowHangingFruit(result.keywords); // ✅ Store extracted keywords
    } else {
      alert("Error extracting keywords.");
    }
  };

  const handleDownload = () => {
    if (!lowHangingFruit.length) return alert("No extracted data to download.");

    const csvContent = [
      ["Keyword", "Position", "Search Volume", "URL"], // ✅ CSV headers
      ...lowHangingFruit.map(({ keyword, position, volume, url }) => [
        keyword,
        position,
        volume,
        url,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "low_hanging_fruit.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-1/4 bg-white p-4 border border-gray-300 rounded-lg overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">CSV Files</h2>

      {/* ✅ Hidden File Input */}
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* ✅ Upload Button */}
      <label
        className="block text-center bg-blue-500 text-white p-2 rounded-lg cursor-pointer mb-4"
        onClick={() => fileInputRef.current.click()}
      >
        Upload CSV
      </label>

      {/* ✅ Display Uploaded Files */}
      {csvFiles.map((fileName, index) => (
        <div
          key={index}
          className="p-2 border-b border-gray-300 cursor-pointer hover:bg-gray-200"
        >
          {fileName}
        </div>
      ))}

      {/* ✅ Extract Low-Hanging Fruit Button (Shows Only After File Upload) */}
      {showExtractButton && (
        <button
          onClick={handleExtractKeywords}
          className="mt-4 w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Extract Low-Hanging Fruit
        </button>
      )}

      {/* ✅ Display Extracted Keywords */}
      {lowHangingFruit.length > 0 && (
        <div className="mt-4 border p-2 w-full bg-gray-100 rounded overflow-y-auto">
          <p className="font-bold text-black mb-2">
            Low-Hanging Fruit Keywords:
          </p>
          <ul className="text-sm text-black list-disc pl-4">
            {lowHangingFruit
              .slice(0, 5)
              .map(({ keyword, position, volume }, index) => (
                <li key={index} className="py-1">
                  <strong>{keyword}</strong> - Position: {position}, Volume:{" "}
                  {volume}
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* ✅ Download CSV Button (Appears After Extraction) */}
      {lowHangingFruit.length > 0 && (
        <button
          onClick={handleDownload}
          className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Download CSV
        </button>
      )}
    </div>
  );
}
