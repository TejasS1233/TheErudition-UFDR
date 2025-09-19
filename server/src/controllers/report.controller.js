import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import processUFDRFolder from "../parsers/orchestrator.parser.js";
import Report from "../models/report.model.js";
import path from "path";
import fs from "fs";
import unzipper from "unzipper";
import logger from "../utils/logger.js";
import os from "os";

const uploadAndProcessReport = asyncHandler(async (req, res) => {
  logger.info("Entering uploadAndProcessReport controller.");

  if (!req.file) {
    logger.error("No file uploaded.");
    return res.status(400).json({ message: "No file uploaded" });
  }

  logger.info("File received:", { file: req.file });

  const zipFilePath = req.file.path;
  // Use system temp directory to avoid Nodemon restarts
  const outputDir = path.join(os.tmpdir(), "ufdr_unzipped", Date.now().toString());

  logger.info("Zip file path:", { zipFilePath });
  logger.info("Output directory:", { outputDir });

  try {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      logger.info("Created output directory.");
    }

    // Unzip the file
    logger.info("Starting file unzip process.");
    await fs
      .createReadStream(zipFilePath)
      .pipe(unzipper.Extract({ path: outputDir }))
      .promise();
    logger.info("File unzipped successfully.");

    // Process the report folder
    logger.info("Starting report processing.");
    const reportData = await processUFDRFolder(outputDir);

    if (!reportData) {
      logger.error("Report processing returned empty data.");
      return res.status(500).json({ message: "Report processing failed." });
    }

    logger.info("Report processed successfully:", { report_id: reportData.report_id });

    // Save report to MongoDB
    const savedReport = await Report.create(reportData);
    logger.info("Report saved to MongoDB with ID:", { reportId: savedReport._id });

    // Send response
    res
      .status(201)
      .json(
        new ApiResponse(201, "Report uploaded and saved successfully.", { reportData: savedReport })
      );
  } catch (err) {
    logger.error("Error processing report:", { error: err });
    res.status(500).json({ message: "Failed to process report" });
  } finally {
    // Cleanup: delete zip and unzipped folder
    logger.info("Starting cleanup process.");
    try {
      if (fs.existsSync(zipFilePath)) {
        fs.unlinkSync(zipFilePath);
        logger.info("Cleaned up zip file.");
      }
      if (fs.existsSync(outputDir)) {
        fs.rmSync(outputDir, { recursive: true, force: true });
        logger.info("Cleaned up unzipped folder.");
      }
    } catch (cleanupErr) {
      logger.error("Error during cleanup:", { error: cleanupErr });
    }
    logger.info("Cleanup process finished.");
  }
});

export { uploadAndProcessReport };
