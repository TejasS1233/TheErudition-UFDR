import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import processUFDRFolder from "../parsers/orchestrator.parser.js";
import path from "path";
import fs from "fs";
import unzipper from "unzipper";

const uploadAndProcessReport = asyncHandler(async (req, res) => {
  console.log("Entering uploadAndProcessReport controller.");

  if (!req.file) {
    console.error("No file uploaded.");
    return res.status(400).json({ message: "No file uploaded" });
  }
  console.log("File received:", req.file);

  const zipFilePath = req.file.path;
  const outputDir = path.join("public", "temp", "ufdr_unzipped", Date.now().toString());

  console.log("Zip file path:", zipFilePath);
  console.log("Output directory:", outputDir);

  try {
    console.log("Creating output directory if it doesn't exist.");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    console.log("Output directory exists.");

    console.log("Starting file unzip process.");
    await fs
      .createReadStream(zipFilePath)
      .pipe(unzipper.Extract({ path: outputDir }))
      .promise();
    console.log("File unzipped successfully.");

    console.log("Starting report processing.");
    const reportData = await processUFDRFolder(outputDir);
    console.log("Report processed successfully.");

    res.status(200).json({
      status: 200,
      data: reportData,
      message: "Report processed successfully",
    });
  } catch (err) {
    console.error("Error processing report:", err);
    res.status(500).json({ message: "Failed to process report" });
  } finally {
    console.log("Starting cleanup process.");
    try {
      if (fs.existsSync(zipFilePath)) {
        fs.unlinkSync(zipFilePath);
        console.log("Cleaned up zip file.");
      }
      if (fs.existsSync(outputDir)) {
        fs.rmSync(outputDir, { recursive: true, force: true });
        console.log("Cleaned up unzipped folder.");
      }
    } catch (cleanupErr) {
      console.error("Error during cleanup:", cleanupErr);
    }
    console.log("Cleanup process finished.");
  }
});

export { uploadAndProcessReport };
