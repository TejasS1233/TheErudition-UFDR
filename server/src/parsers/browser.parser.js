import fs from "fs";
import path from "path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export const parseBrowserHistory = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  try {
    if (ext === ".json") {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const history = JSON.parse(fileContent);
      return history.map((item, i) => ({
        history_id: item.id || `json_${i}`,
        url: item.url || null,
        title: item.title || null,
        timestamp: item.timestamp ? new Date(item.timestamp) : null,
        browser: "firefox",
        file_path: filePath,
        raw: JSON.stringify(item),
      }));
    } else if (ext === ".db" || ext === ".sqlite") {
      const db = await open({ filename: filePath, driver: sqlite3.Database });
      const rows = await db.all("SELECT id, url, title, ts FROM history");
      await db.close();

      return rows.map((row) => ({
        history_id: row.id,
        url: row.url,
        title: row.title,
        timestamp: row.ts ? new Date(row.ts) : null,
        browser: "chrome",
        file_path: filePath,
        raw: JSON.stringify(row),
      }));
    } else {
      console.warn(`Unsupported browser history format: ${filePath}`);
      return [];
    }
  } catch (error) {
    console.error(`Error parsing browser history file ${filePath}:`, error);
    return [];
  }
};
