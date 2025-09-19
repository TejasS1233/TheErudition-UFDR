import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { faker } from "@faker-js/faker";

import pdfLib from "pdf-lib";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UFDR_FOLDER = path.join(__dirname, "UFDR_SAMPLE");

// -------------------- Helpers --------------------
const mkdir = (folderPath) => {
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
};

const writeJSON = (folder, fileName, data) => {
  fs.writeFileSync(path.join(folder, fileName), JSON.stringify(data, null, 2));
};

const writeCSV = (folder, fileName, headers, rows) => {
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  fs.writeFileSync(path.join(folder, fileName), csv);
};

const writeXML = (folder, fileName, rootName, items) => {
  const xmlItems = items
    .map((i) => {
      const fields = Object.entries(i)
        .map(([k, v]) => `<${k}>${v}</${k}>`)
        .join("");
      return `<item>${fields}</item>`;
    })
    .join("");
  const xml = `<${rootName}>${xmlItems}</${rootName}>`;
  fs.writeFileSync(path.join(folder, fileName), xml);
};

const createDummyMedia = (folder, name, ext) => {
  fs.writeFileSync(path.join(folder, `${name}.${ext}`), `This is dummy ${ext} content`);
};

const createDummyPDF = async (folder, fileName, text) => {
  const pdfDoc = await pdfLib.PDFDocument.create();
  const page = pdfDoc.addPage();
  page.drawText(text || "Dummy PDF content");
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(path.join(folder, fileName), pdfBytes);
};

const createDummyDoc = (folder, fileName) => {
  fs.writeFileSync(path.join(folder, fileName), "Dummy DOCX content");
};

const createDummySQLite = async (folder, fileName) => {
  const db = await open({ filename: path.join(folder, fileName), driver: sqlite3.Database });
  await db.exec(`
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY, 
      url TEXT, 
      title TEXT, 
      ts TEXT
    );
  `);
  for (let i = 0; i < 5; i++) {
    await db.run(
      "INSERT INTO history(url,title,ts) VALUES(?,?,?)",
      faker.internet.url(),
      faker.lorem.sentence(),
      faker.date.recent().toISOString()
    );
  }
  await db.close();
};

// -------------------- Main --------------------
const generateUFDRSample = async () => {
  mkdir(UFDR_FOLDER);

  // -------- Messages (JSON) --------
  const messagesFolder = path.join(UFDR_FOLDER, "messages");
  mkdir(messagesFolder);
  const msgJSON = Array.from({ length: 10 }, (_, i) => ({
    id: `M${i + 1}`,
    platform: faker.helpers.arrayElement(["WhatsApp", "Telegram", "SMS"]),
    sender: faker.person.firstName(),
    receiver: faker.person.firstName(),
    content: faker.lorem.sentence(),
    timestamp: faker.date.recent().toISOString(),
    attachments: ["dummy_file.jpg"],
    deleted: faker.datatype.boolean(),
  }));
  writeJSON(messagesFolder, "messages.json", msgJSON);

  // -------- Calls (XML) --------
  const callsFolder = path.join(UFDR_FOLDER, "calls");
  mkdir(callsFolder);
  const callXML = Array.from({ length: 5 }, (_, i) => ({
    id: `C${i + 1}`,
    caller: faker.phone.number(),
    callee: faker.phone.number(),
    duration: faker.number.int({ min: 10, max: 3600 }),
    type: faker.helpers.arrayElement(["incoming", "outgoing", "missed", "voip_video"]),
    timestamp: faker.date.recent().toISOString(),
    deleted: faker.datatype.boolean(),
  }));
  writeXML(callsFolder, "calls.xml", "calls", callXML);

  // -------- Media --------
  const mediaFolder = path.join(UFDR_FOLDER, "media");
  mkdir(mediaFolder);
  ["images", "videos", "audio"].forEach((sub) => mkdir(path.join(mediaFolder, sub)));
  createDummyMedia(path.join(mediaFolder, "images"), "img_001", "jpg");
  createDummyMedia(path.join(mediaFolder, "images"), "img_002", "png");
  createDummyMedia(path.join(mediaFolder, "videos"), "video_001", "mp4");
  createDummyMedia(path.join(mediaFolder, "audio"), "audio_001", "mp3");

  // -------- Documents --------
  const docsFolder = path.join(UFDR_FOLDER, "documents");
  mkdir(docsFolder);
  await createDummyPDF(docsFolder, "file_001.pdf");
  createDummyDoc(docsFolder, "file_002.docx");
  fs.writeFileSync(path.join(docsFolder, "file_003.xlsx"), "Dummy Excel content");

  // -------- Browser History --------
  const browserFolder = path.join(UFDR_FOLDER, "browser_history");
  mkdir(browserFolder);
  await createDummySQLite(browserFolder, "chrome_history.db");
  writeJSON(
    browserFolder,
    "firefox_history.json",
    Array.from({ length: 5 }, () => ({
      url: faker.internet.url(),
      title: faker.lorem.sentence(),
      timestamp: faker.date.recent().toISOString(),
    }))
  );

  // -------- Locations (CSV) --------
  const locFolder = path.join(UFDR_FOLDER, "locations");
  mkdir(locFolder);
  writeCSV(
    locFolder,
    "locations.csv",
    ["lat", "long", "source", "timestamp"],
    Array.from({ length: 3 }, () => [
      faker.location.latitude(),
      faker.location.longitude(),
      faker.helpers.arrayElement(["gps", "wifi", "app"]),
      faker.date.recent().toISOString(),
    ])
  );

  // -------- Transactions (JSON) --------
  const txnFolder = path.join(UFDR_FOLDER, "transactions");
  mkdir(txnFolder);
  writeJSON(
    txnFolder,
    "crypto_txns.json",
    Array.from({ length: 2 }, (_, i) => ({
      txn_id: `TXN${i + 1}`,
      from_user: faker.finance.bitcoinAddress(),
      to_user: faker.finance.bitcoinAddress(),
      amount: faker.finance.amount(0.01, 10, 4),
      currency: "BTC",
      timestamp: faker.date.recent().toISOString(),
    }))
  );

  // -------- Apps --------
  const appsFolder = path.join(UFDR_FOLDER, "apps");
  mkdir(appsFolder);
  writeJSON(
    appsFolder,
    "installed_apps.json",
    Array.from({ length: 5 }, () => ({
      name: faker.company.name(),
      version: `${faker.number.int({ min: 1, max: 10 })}.${faker.number.int({ min: 0, max: 9 })}`,
      last_opened: faker.date.recent().toISOString(),
      type: faker.helpers.arrayElement(["system", "social", "messaging", "finance", "other"]),
      usage_stats: { hours: faker.number.int({ min: 1, max: 10 }) },
    }))
  );

  // -------- Security --------
  const secFolder = path.join(UFDR_FOLDER, "security");
  mkdir(secFolder);
  writeJSON(secFolder, "device_security.json", {
    lock_type: faker.helpers.arrayElement(["PIN", "Password", "Pattern"]),
    jailbroken: faker.datatype.boolean(),
    encryption_enabled: faker.datatype.boolean(),
    system_logs: [faker.lorem.sentence(), faker.lorem.sentence()],
  });

  // -------- Deleted Data --------
  const delFolder = path.join(UFDR_FOLDER, "deleted_data");
  mkdir(delFolder);
  writeJSON(
    delFolder,
    "deleted_messages.json",
    Array.from({ length: 2 }, () => ({
      original_id: faker.string.uuid(),
      data_type: "message",
      recovery_status: faker.helpers.arrayElement(["recovered", "partially_recovered"]),
    }))
  );
  writeJSON(
    delFolder,
    "deleted_files.json",
    Array.from({ length: 2 }, () => ({
      original_id: faker.string.uuid(),
      data_type: "file",
      recovery_status: faker.helpers.arrayElement(["recovered", "partially_recovered"]),
    }))
  );

  console.log("✅ UFDR_SAMPLE folder generated successfully!");
};

generateUFDRSample();
