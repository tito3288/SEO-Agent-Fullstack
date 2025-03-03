"use client"; // ✅ Required for hooks in Next.js App Router

import { useState, useRef } from "react";

export default function UploadCSV() {
  const [file, setFile] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const [lowHangingFruit, setLowHangingFruit] = useState([]); // ✅ Stores ALL extracted data
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);

    // ✅ Read CSV File and Preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split("\n").map((row) => row.split(","));
      setCsvData(rows.slice(0, 5)); // ✅ Show only first 5 rows
    };
    reader.readAsText(selectedFile);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
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
      setLowHangingFruit(result.keywords); // ✅ Store ALL extracted keywords
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
    <div className="flex flex-col items-center p-6 bg-white shadow rounded-lg w-full max-w-4xl">
      {/* ✅ Hidden File Input */}
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* ✅ Display Selected File Name */}
      {file && <p className="mb-2 text-sm text-gray-700">📄 {file.name}</p>}

      {/* ✅ Show CSV Preview */}
      {csvData && (
        <div className="mt-4 border p-2 w-full max-w-4xl bg-gray-100 rounded overflow-x-auto">
          {" "}
          <p className="font-bold text-black">CSV Preview:</p>
          <div className="w-full max-w-4xl overflow-x-auto">
            <table className="table-auto w-full max-w-4xl text-sm border-collapse text-black">
              <tbody>
                {csvData.map((row, index) => (
                  <tr key={index} className="border-b">
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-2 py-1 break-words max-w-xs"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ✅ Buttons */}
      <div className="mt-4 space-x-2">
        <button
          onClick={triggerFileInput}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          Upload CSV
        </button>
        <button
          onClick={handleExtractKeywords}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Find Low-Hanging Fruit
        </button>
        {lowHangingFruit.length > 0 && (
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Download CSV
          </button>
        )}
      </div>

      {/* ✅ Show Extracted Low-Hanging Fruit (Only first 5 rows) */}
      {lowHangingFruit.length > 0 && (
        <div className="mt-4 border p-2 w-full max-w-4xl bg-gray-100 rounded overflow-x-auto">
          <p className="font-bold text-black">Low-Hanging Fruit:</p>
          <div className="w-full max-w-4xl overflow-x-auto">
            <table className="table-auto w-full max-w-4xl text-sm border-collapse text-black">
              <tbody>
                {lowHangingFruit
                  .slice(0, 5)
                  .map(({ keyword, position, volume, url }, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-2 py-1 break-words max-w-xs">
                        {keyword}
                      </td>
                      <td className="px-2 py-1">{position}</td>
                      <td className="px-2 py-1">{volume}</td>
                      <td className="px-2 py-1 break-words max-w-xs">{url}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
