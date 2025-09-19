import fs from "fs";
import path from "path";
import { parse as parseCSV } from "csv-parse/sync";
import xml2js from "xml2js";

export const parseDeletedData = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  let records = [];

  try {
    if (ext === ".json") {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(fileContent);
      records = Array.isArray(data) ? data : [data];
    } else if (ext === ".csv") {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      records = parseCSV(fileContent, { columns: true });
    } else if (ext === ".xml") {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const parsed = await xml2js.parseStringPromise(fileContent);

      if (parsed.deleted?.item) {
        records = parsed.deleted.item.map((d) => ({
          original_id: d.original_id?.[0],
          data_type: d.data_type?.[0],
          recovery_status: d.recovery_status?.[0],
        }));
      }
    } else if (ext === ".txt") {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      records = fileContent.split("\n").map((line, i) => ({
        id: `txt_${i}`,
        raw: line.trim(),
      }));
    } else {
      console.warn(`Unknown format for ${filePath}, treating as raw text.`);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      records = fileContent.split("\n").map((line, i) => ({
        id: `raw_${i}`,
        raw: line.trim(),
      }));
    }

    const normalized = records.map((item, i) => ({
      original_id: item.original_id || item.id || `rec_${i}`,
      data_type: item.data_type || item.type || "unknown",
      recovery_status: item.recovery_status || item.status || "unknown",
      file_path: filePath,
      raw: item.raw || JSON.stringify(item), // keep raw record for forensic trace
    }));

    return normalized;
  } catch (error) {
    console.error(`Error parsing deleted data file ${filePath}:`, error);
    return [];
  }
};
