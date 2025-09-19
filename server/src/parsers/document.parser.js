import fs from "fs";
import path from "path";
import { execFile } from "child_process";
import mammoth from "mammoth";
import * as XLSX from "xlsx";

const POPPLER_BIN =
  "C:\\Users\\tejas\\poppler-24.02.0\\Library\\bin\\poppler-25.07.0\\Library\\bin\\pdftotext.exe";

const extractPdfWithPoppler = (filePath) => {
  return new Promise((resolve, reject) => {
    execFile(
      POPPLER_BIN,
      ["-layout", filePath, "-"],
      { encoding: "utf8" },
      (error, stdout, stderr) => {
        if (error) return reject(error);
        resolve(stdout);
      }
    );
  });
};

export const parseDocuments = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  if (!fs.existsSync(filePath)) {
    return { content: "", file_path: filePath, error: "File does not exist" };
  }

  try {
    if (ext === ".pdf") {
      const text = await extractPdfWithPoppler(filePath);
      return { content: text, file_path: filePath };
    }

    if (ext === ".docx") {
      const result = await mammoth.extractRawText({ path: filePath });
      return { content: result.value, file_path: filePath };
    }

    if (ext === ".doc") {
      const raw = fs.readFileSync(filePath, "utf-8");
      return { content: raw, file_path: filePath };
    }

    if (ext === ".xlsx" || ext === ".csv") {
      const workbook = XLSX.readFile(filePath);
      const sheetsData = workbook.SheetNames.map((name) => ({
        sheet: name,
        rows: XLSX.utils.sheet_to_json(workbook.Sheets[name]),
      }));
      return { content: JSON.stringify(sheetsData, null, 2), file_path: filePath };
    }

    const raw = fs.readFileSync(filePath, "utf-8");
    return { content: raw, file_path: filePath };
  } catch (error) {
    console.error(`❌ Error parsing document ${filePath}:`, error);
    return { content: "", file_path: filePath, error: error.message };
  }
};
