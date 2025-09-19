import fs from "fs";
import path from "path";
import { parse as parseCSV } from "csv-parse/sync";
import xml2js from "xml2js";

export const parseLocations = async (filePath) => {
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
      if (parsed.locations?.location) {
        records = parsed.locations.location.map((loc) => ({
          id: loc.id?.[0],
          latitude: loc.lat?.[0],
          longitude: loc.lon?.[0],
          accuracy: loc.accuracy?.[0],
          timestamp: loc.timestamp?.[0],
          source: loc.source?.[0],
        }));
      }
    } else if (ext === ".txt") {
      const raw = fs.readFileSync(filePath, "utf-8");
      records = raw.split("\n").map((line, i) => {
        const parts = line.split(",");
        return {
          id: `txt_${i}`,
          latitude: parts[0] || null,
          longitude: parts[1] || null,
          accuracy: parts[2] || null,
          timestamp: parts[3] || null,
          source: parts[4] || "unknown",
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

    return records.map((loc, i) => ({
      location_id: loc.id || loc.location_id || `loc_${i}`,
      latitude: parseFloat(loc.latitude || loc.lat || 0),
      longitude: parseFloat(loc.longitude || loc.lon || 0),
      accuracy: parseFloat(loc.accuracy || 0),
      timestamp: loc.timestamp ? new Date(loc.timestamp) : null,
      source: loc.source || "unknown",
      file_path: filePath,
      raw: loc.raw || JSON.stringify(loc),
    }));
  } catch (error) {
    console.error(`Error parsing location file ${filePath}:`, error);
    return [];
  }
};
