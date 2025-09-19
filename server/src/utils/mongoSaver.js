import mongoose from 'mongoose';
import Report from '../models/report.model.js';

export const saveReport = async (reportData) => {
  const report = new Report(reportData);
  try {
    await report.save();
    console.log("Report saved successfully!");
  } catch(err) { console.error("Mongo save error:", err); }
};
