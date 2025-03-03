import fs from "fs";
import { promises as fsPromises } from "fs";
import path from "path";
import csvParser from "csv-parser";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const data = await req.formData();
    const file = data.get("file");

    if (!file) {
      console.error("❌ No file received in API.");
      return NextResponse.json({ success: false, message: "No file uploaded" });
    }

    // ✅ Ensure the uploads directory exists
    const uploadDir = path.join(process.cwd(), "uploads");
    await fsPromises.mkdir(uploadDir, { recursive: true });

    const fileBuffer = await file.arrayBuffer();
    const filePath = path.join(uploadDir, file.name);
    await fsPromises.writeFile(filePath, Buffer.from(fileBuffer));

    console.log(`✅ File saved at: ${filePath}`);

    const extractedKeywords = [];
    let firstFewRows = [];

    console.log("✅ File saved, now parsing...");

    // ✅ Use a Promise to handle stream properly
    await new Promise((resolve, reject) => {
      const csvStream = fs.createReadStream(filePath).pipe(csvParser());

      csvStream
        .on("data", (row) => {
          try {
            if (
              !row["Keyword"] ||
              !row["Current position"] ||
              !row["Current URL"]
            ) {
              console.warn(
                "⚠️ Skipping row due to missing essential data:",
                row
              );
              return;
            }

            const position = parseInt(row["Current position"], 10) || 0;
            const volume = parseInt(row["Volume"], 10) || 0;
            const keyword = row["Keyword"] || "Unknown Keyword";
            const url = row["Current URL"] || "No URL Provided";

            if (position >= 11 && position <= 20) {
              extractedKeywords.push({ keyword, position, volume, url });
            }

            if (firstFewRows.length < 5) {
              firstFewRows.push({ keyword, position, volume, url });
            }
          } catch (err) {
            console.error("🚨 Error parsing row:", err);
          }
        })
        .on("end", resolve)
        .on("error", (err) => {
          console.error("🚨 CSV Parsing Error:", err);
          reject(err);
        });
    });

    console.log(`✅ Extracted ${extractedKeywords.length} keywords`);
    console.log(`📄 First few rows:`, firstFewRows);

    return NextResponse.json({
      success: true,
      message: "Extracted Page 2 keywords successfully",
      keywords: extractedKeywords,
      previewRows: firstFewRows,
    });
  } catch (error) {
    console.error("❌ Backend Error:", error);

    // ✅ Return JSON response instead of crashing
    return NextResponse.json({
      success: false,
      message: "Error processing file",
      error: error.message,
    });
  }
}
