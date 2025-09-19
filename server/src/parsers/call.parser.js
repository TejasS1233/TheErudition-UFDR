import fs from "fs";
import path from "path";
import { parse as parseCSV } from "csv-parse/sync";
import xml2js from "xml2js";

export const parseCalls = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  let records = [];

  try {
    if (ext === ".json") {
      const raw = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(raw);
      records = Array.isArray(data) ? data : [data];
    } else if (ext === ".csv") {
      const raw = fs.readFileSync(filePath, "utf-8");
      records = parseCSV(raw, { columns: true });
    } else if (ext === ".xml") {
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = await xml2js.parseStringPromise(raw);
      if (parsed.calls?.call) {
        records = parsed.calls.call.map((c) => ({
          id: c.id?.[0],
          caller: c.caller?.[0],
          callee: c.callee?.[0],
          duration: c.duration?.[0],
          type: c.type?.[0],
          timestamp: c.timestamp?.[0],
          deleted: c.deleted?.[0] === "true",
        }));
      } else if (parsed.calls?.item) {
        records = parsed.calls.item.map((c) => ({
          id: c.id?.[0],
          caller: c.caller?.[0],
          callee: c.callee?.[0],
          duration: c.duration?.[0],
          type: c.type?.[0],
          timestamp: c.timestamp?.[0],
          deleted: c.deleted?.[0] === "true",
        }));
      }
    } else if (ext === ".txt") {
      const raw = fs.readFileSync(filePath, "utf-8");
      records = raw.split("\n").map((line, i) => {
        const parts = line.split(",");
        return {
          id: `txt_${i}`,
          caller: parts[0] || "",
          callee: parts[1] || "",
          duration: parts[2] || 0,
          type: parts[3] || "unknown",
          timestamp: parts[4] || null,
        };
      });
    } else {
      console.warn(`Unknown format for ${filePath}, treating as raw text.`);
      const raw = fs.readFileSync(filePath, "utf-8");
      records = raw.split("\n").map((line, i) => ({
        id: `raw_${i}`,
        raw: line.trim(),
      }));
    }

    return records.map((call, i) => ({
      call_id: call.id || call.call_id || `rec_${i}`,
      caller: call.caller || call.from || "unknown",
      callee: call.callee || call.to || "unknown",
      duration: parseInt(call.duration || 0, 10),
      call_type: call.type || call.call_type || "unknown",
      timestamp: call.timestamp ? new Date(call.timestamp) : null,
      deleted: call.deleted || false,
      file_path: filePath,
      raw: call.raw || JSON.stringify(call),
    }));
  } catch (err) {
    console.error(`Error parsing calls from ${filePath}:`, err);
    return [];
  }
};
