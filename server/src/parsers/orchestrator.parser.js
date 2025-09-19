import { loadFilesRecursive } from "../utils/fileLoader.js";
import { parseMessages } from "./message.parser.js";
import { parseCalls } from "./call.parser.js";
import { parseMedia } from "./media.parser.js";
import { parseBrowserHistory } from "./browser.parser.js";
import { parseDocuments } from "./document.parser.js";
import { parseCrypto } from "./crypto.parser.js";
import { parseLocations } from "./location.parser.js";
import { parseApps } from "./app.parser.js";
import { parseDeletedData } from "./deleted_data.parser.js";

const CALL_TYPE_MAP = {
  0: "incoming",
  1: "outgoing",
  2: "missed",
  3: "voip_video",
  4: "conference",
};

const processUFDRFolder = async (folderPath) => {
  const reportData = { report_id: Date.now().toString() };

  // ------------------- Messages -------------------
  const msgFiles = loadFilesRecursive(folderPath, "messages", ".json");
  const messagesArrays = await Promise.all(msgFiles.map((f) => parseMessages(f)));
  reportData.messages = messagesArrays.flat();
  reportData.messages = reportData.messages.map((m) => {
    const ts = new Date(m.timestamp);
    m.timestamp = isNaN(ts) ? null : ts;
    return m;
  });

  // ------------------- Calls -------------------
  const callFiles = loadFilesRecursive(folderPath, "calls", ".json");
  const callsArrays = await Promise.all(callFiles.map((f) => parseCalls(f)));
  reportData.calls = callsArrays.flat();
  reportData.calls = reportData.calls.map((c) => {
    c.call_type = CALL_TYPE_MAP[c.call_type] || "incoming";
    const ts = new Date(c.timestamp);
    c.timestamp = isNaN(ts) ? null : ts;
    return c;
  });

  // ------------------- Media -------------------
  const mediaFiles = loadFilesRecursive(folderPath, "media");
  const mediaArrays = await Promise.all(mediaFiles.map((f) => parseMedia(f)));
  reportData.media = mediaArrays.flat().filter(Boolean);

  // ------------------- Browser History -------------------
  const browserFiles = loadFilesRecursive(folderPath, "browser", ".json");
  const browserArrays = await Promise.all(browserFiles.map((f) => parseBrowserHistory(f)));
  reportData.browserHistory = browserArrays.flat();

  // ------------------- Documents -------------------
  const docFiles = loadFilesRecursive(folderPath, "documents");
  const docArrays = await Promise.all(docFiles.map((f) => parseDocuments(f)));
  reportData.documents = docArrays.flat();

  // ------------------- Crypto -------------------
  const cryptoFiles = loadFilesRecursive(folderPath, "crypto", ".json");
  const cryptoArrays = await Promise.all(cryptoFiles.map((f) => parseCrypto(f)));
  reportData.crypto = cryptoArrays.flat();

  // ------------------- Locations -------------------
  const locationFiles = loadFilesRecursive(folderPath, "locations", ".json");
  const locationArrays = await Promise.all(locationFiles.map((f) => parseLocations(f)));
  reportData.locations = locationArrays.flat();

  // ------------------- Apps -------------------
  const appFiles = loadFilesRecursive(folderPath, "apps", ".json");
  const appArrays = await Promise.all(appFiles.map((f) => parseApps(f)));
  reportData.apps = appArrays.flat();

  // ------------------- Deleted Data -------------------
  const deletedDataFiles = loadFilesRecursive(folderPath, "deleted_data", ".json");
  const deletedArrays = await Promise.all(deletedDataFiles.map((f) => parseDeletedData(f)));
  reportData.deletedData = deletedArrays.flat();

  return reportData;
};

export default processUFDRFolder;
