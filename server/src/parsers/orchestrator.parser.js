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
import { saveReport } from "../utils/mongoSaver.js";

const processUFDRFolder = async (folderPath) => {
  const reportData = { report_id: Date.now().toString() };

  // Messages
  const msgFiles = loadFilesRecursive(folderPath, "messages", ".json");
  reportData.messages = msgFiles.flatMap((f) => parseMessages(f));

  // Calls
  const callFiles = loadFilesRecursive(folderPath, "calls", ".json");
  reportData.calls = callFiles.flatMap((f) => parseCalls(f));

  // Media
  const mediaFiles = loadFilesRecursive(folderPath, "media");
  const mediaPromises = mediaFiles.map((f) => parseMedia(f));
  reportData.media = (await Promise.all(mediaPromises)).filter(Boolean);

  // Browser History
  const browserFiles = loadFilesRecursive(folderPath, "browser", ".json");
  reportData.browserHistory = browserFiles.flatMap((f) => parseBrowserHistory(f));

  // Documents
  const docFiles = loadFilesRecursive(folderPath, "documents");
  reportData.documents = docFiles.flatMap((f) => parseDocuments(f));

  // Crypto
  const cryptoFiles = loadFilesRecursive(folderPath, "crypto", ".json");
  reportData.crypto = cryptoFiles.flatMap((f) => parseCrypto(f));

  // Locations
  const locationFiles = loadFilesRecursive(folderPath, "locations", ".json");
  reportData.locations = locationFiles.flatMap((f) => parseLocations(f));

  // Apps
  const appFiles = loadFilesRecursive(folderPath, "apps", ".json");
  reportData.apps = appFiles.flatMap((f) => parseApps(f));

  // Deleted Data
  const deletedDataFiles = loadFilesRecursive(folderPath, "deleted_data", ".json");
  reportData.deletedData = deletedDataFiles.flatMap((f) => parseDeletedData(f));

  await saveReport(reportData);
  return reportData;
};

export default processUFDRFolder;
