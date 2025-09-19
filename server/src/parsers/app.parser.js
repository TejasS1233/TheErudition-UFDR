import fs from "fs";
import path from "path";
import { parse as parseCSV } from "csv-parse/sync";
import xml2js from "xml2js";

export const parseApps = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  let records = [];

  try {
    if (ext === ".json") {
      const raw = fs.readFileSync(filePath, "utf-8");
      records = JSON.parse(raw);
      if (!Array.isArray(records)) records = [records];
    } else if (ext === ".csv") {
      const raw = fs.readFileSync(filePath, "utf-8");
      records = parseCSV(raw, { columns: true });
    } else if (ext === ".xml") {
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = await xml2js.parseStringPromise(raw);
      if (parsed.apps?.app) {
        records = parsed.apps.app.map((a) => ({
          id: a.id?.[0],
          name: a.name?.[0],
          version: a.version?.[0],
          package: a.package?.[0],
          installed_at: a.installed_at?.[0],
          last_used: a.last_used?.[0],
        }));
      }
    } else if (ext === ".txt") {
      const raw = fs.readFileSync(filePath, "utf-8");
      records = raw.split("\n").map((line, i) => {
        const parts = line.split(",");
        return {
          id: `txt_${i}`,
          name: parts[0] || null,
          version: parts[1] || null,
          package: parts[2] || null,
          installed_at: parts[3] || null,
          last_used: parts[4] || null,
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

    return records.map((app, i) => ({
      app_id: app.id || app.app_id || `app_${i}`,
      name: app.name || app.appName || "Unknown",
      version: app.version || "Unknown",
      package: app.package || app.package_name || null,
      last_opened: app.last_opened
        ? new Date(app.last_opened)
        : app.last_used
          ? new Date(app.last_used)
          : null,
      type: app.type || "other",
      usage_stats: app.usage_stats || {},
      file_path: filePath,
      raw: app.raw || JSON.stringify(app),
    }));
  } catch (error) {
    console.error(`Error parsing app file ${filePath}:`, error);
    return [];
  }
};
