import fs from "fs";
import { PDFDocument } from "pdf-lib";
import pdf from "pdf-parse";

export const getPdfPageCount = async (filePath) => {
  const fileBuffer = fs.readFileSync(filePath);
  const pdfDoc = await PDFDocument.load(fileBuffer);
  return pdfDoc.getPageCount();
};

export const extractPdfText = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
};
