import mongoose from "mongoose";
import Report from "./models/report.model.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://Tejas:Tejas@cluster0.wnuycfg.mongodb.net";

async function clearAllReports() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: "SIH-UFDR" });
    console.log("Connected to MongoDB");

    const result = await Report.deleteMany({});
    console.log(`Deleted ${result.deletedCount} reports from MongoDB`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (err) {
    console.error("Error clearing reports:", err);
  }
}

clearAllReports();
