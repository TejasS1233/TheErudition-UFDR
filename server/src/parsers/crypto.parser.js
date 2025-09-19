import fs from "fs";
import path from "path";
import { parse as parseCSV } from "csv-parse/sync";
import xml2js from "xml2js";

export const parseCrypto = async (filePath) => {
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

      if (parsed.transactions?.transaction) {
        records = parsed.transactions.transaction.map((tx) => ({
          id: tx.id?.[0],
          amount: tx.amount?.[0],
          currency: tx.currency?.[0],
          type: tx.type?.[0],
          timestamp: tx.timestamp?.[0],
          source: "xml",
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

    // ✅ Normalize schema
    const normalized = records.map((item, i) => ({
      id: item.id || item.txid || item.hash || `rec_${i}`,
      currency: item.currency || item.coin || "unknown",
      amount: parseFloat(item.amount || item.value || 0),
      type: item.type || item.category || "transaction",
      timestamp: item.timestamp ? new Date(item.timestamp) : item.date ? new Date(item.date) : null,
      source: item.source || ext.replace(".", "") || "unknown",
      file_path: filePath,
      raw: item.raw || JSON.stringify(item), // keep raw data for forensics
    }));

    return normalized;
  } catch (error) {
    console.error(`Error parsing crypto file ${filePath}:`, error);
    return [];
  }
};
