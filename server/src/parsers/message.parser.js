import fs from "fs";
import path from "path";
import xml2js from "xml2js";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { parse } from "csv-parse/sync";

export const parseMessages = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  let messages = [];

  try {
    if (ext === ".json") {
      const raw = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(raw);

      data.forEach((msg) => {
        messages.push({
          message_id: msg.id || msg.uuid || null,
          sender: msg.sender || msg.from || null,
          receiver: msg.receiver || msg.to || null,
          platform: msg.platform || msg.app || "unknown",
          content: msg.text || msg.body || msg.message || "",
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
          attachments: msg.attachments || msg.files || [],
          deleted: msg.deleted ?? false,
        });
      });
    } else if (ext === ".xml") {
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = await xml2js.parseStringPromise(raw);

      if (parsed.smses?.sms) {
        parsed.smses.sms.forEach((sms, i) => {
          messages.push({
            message_id: sms.$?.id || `xml_${i}`,
            sender: sms.$?.address || null,
            receiver: null,
            platform: "sms",
            content: sms.$?.body || "",
            timestamp: sms.$?.date ? new Date(Number(sms.$.date)) : new Date(),
            attachments: [],
            deleted: false,
          });
        });
      }
    } else if (ext === ".db" || ext === ".sqlite") {
      const db = await open({ filename: filePath, driver: sqlite3.Database });
      const rows = await db.all("SELECT * FROM messages");
      rows.forEach((msg) => {
        messages.push({
          message_id: msg.id || null,
          sender: msg.sender || msg.from || null,
          receiver: msg.receiver || msg.to || null,
          platform: msg.platform || "unknown",
          content: msg.content || msg.body || "",
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
          attachments: [],
          deleted: msg.deleted ?? false,
        });
      });
      await db.close();
    } else if (ext === ".csv" || ext === ".txt") {
      const raw = fs.readFileSync(filePath, "utf-8");

      let rows = [];
      try {
        rows = parse(raw, { columns: true });
      } catch {
        rows = raw.split("\n").map((line) => ({ content: line }));
      }

      rows.forEach((msg, i) => {
        messages.push({
          message_id: msg.id || `txt_${i}`,
          sender: msg.sender || msg.from || null,
          receiver: msg.receiver || msg.to || null,
          platform: msg.platform || "unknown",
          content: msg.content || msg.body || msg.message || "",
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
          attachments: [],
          deleted: false,
        });
      });
    } else {
      const raw = fs.readFileSync(filePath, "utf-8");
      raw.split("\n").forEach((line, i) => {
        if (line.trim()) {
          messages.push({
            message_id: `raw_${i}`,
            sender: "unknown",
            receiver: "unknown",
            platform: "unknown",
            content: line.trim(),
            timestamp: new Date(),
            attachments: [],
            deleted: false,
          });
        }
      });
    }
  } catch (err) {
    console.error(`Error parsing messages from ${filePath}:`, err);
  }

  return messages;
};
