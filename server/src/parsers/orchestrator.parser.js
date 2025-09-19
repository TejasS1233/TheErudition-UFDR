import { loadFilesRecursive } from "../utils/fileLoader.js";
import fs from "fs";
import path from "path";
import { parseMessages } from "./message.parser.js";
import { parseCalls } from "./call.parser.js";
import { parseMedia } from "./media.parser.js";
import { parseBrowserHistory } from "./browser.parser.js";
import { parseDocuments } from "./document.parser.js";
import { parseCrypto } from "./crypto.parser.js";
import { parseLocations } from "./location.parser.js";
import { parseApps } from "./app.parser.js";
import { parseDeletedData } from "./deleted_data.parser.js";
import logger from "../utils/logger.js";

const CALL_TYPE_MAP = {
  0: "incoming",
  1: "outgoing",
  2: "missed",
  3: "voip_video",
  4: "conference",
};

const processUFDRFolder = async (folderPath) => {
  const reportData = { report_id: Date.now().toString() };
  logger.info("Processing UFDR folder:", { folderPath });

  try {
    const contents = fs.readdirSync(folderPath);
    logger.info("Folder contents:", { contents });

    const nestedPath = path.join(folderPath, "UFDR_SAMPLE");
    if (fs.existsSync(nestedPath)) {
      logger.info("Found nested UFDR_SAMPLE folder, using that instead");
      folderPath = nestedPath;
      const nestedContents = fs.readdirSync(folderPath);
      logger.info("Nested folder contents:", { nestedContents });
    }
  } catch (err) {
    logger.error("Error reading folder contents:", { error: err });
  }

  try {
    const userProfilePath = path.join(folderPath, "user_profile.json");
    if (fs.existsSync(userProfilePath)) {
      const userProfileData = JSON.parse(fs.readFileSync(userProfilePath, "utf-8"));
      reportData.user_profile = userProfileData;
      logger.info("Parsed user profile:", { userProfile: userProfileData });
    } else {
      logger.info("No user profile file found");
      reportData.user_profile = {
        aliases: [],
        phones: [],
        emails: [],
        addresses: [],
        cloud_accounts: [],
        social_handles: [],
      };
    }
  } catch (err) {
    logger.error("Error parsing user profile:", { error: err });
    reportData.user_profile = {
      aliases: [],
      phones: [],
      emails: [],
      addresses: [],
      cloud_accounts: [],
      social_handles: [],
    };
  }

  const msgFiles = loadFilesRecursive(folderPath, "messages", ".json");
  logger.info("Found message files:", { msgFiles });
  const messagesArrays = await Promise.all(msgFiles.map((f) => parseMessages(f)));
  reportData.messages = messagesArrays.flat();
  logger.info("Parsed messages count:", { count: reportData.messages.length });
  reportData.messages = reportData.messages.map((m) => {
    if (m.timestamp && !(m.timestamp instanceof Date)) {
      const ts = new Date(m.timestamp);
      m.timestamp = isNaN(ts.getTime()) ? new Date() : ts;
    }
    return m;
  });

  const callFiles = loadFilesRecursive(folderPath, "calls", ".json");
  logger.info("Found call files:", { callFiles });

  const callXmlFiles = loadFilesRecursive(folderPath, "calls", ".xml");
  logger.info("Found call XML files:", { callXmlFiles });

  const allCallFiles = [...callFiles, ...callXmlFiles];
  const callsArrays = await Promise.all(allCallFiles.map((f) => parseCalls(f)));
  reportData.calls = callsArrays.flat();
  logger.info("Parsed calls count:", { count: reportData.calls.length });
  reportData.calls = reportData.calls.map((c) => {
    if (typeof c.call_type === "number") {
      c.call_type = CALL_TYPE_MAP[c.call_type] || "incoming";
    }
    if (c.timestamp && !(c.timestamp instanceof Date)) {
      const ts = new Date(c.timestamp);
      c.timestamp = isNaN(ts.getTime()) ? new Date() : ts;
    }
    return c;
  });

  const mediaFiles = [];
  const mediaDir = path.join(folderPath, "media");
  if (fs.existsSync(mediaDir)) {
    const findMediaFiles = (dir) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          findMediaFiles(fullPath);
        } else {
          const ext = path.extname(item).toLowerCase();
          if (
            [
              ".jpg",
              ".jpeg",
              ".png",
              ".gif",
              ".webp",
              ".tiff",
              ".mp4",
              ".mov",
              ".avi",
              ".mkv",
              ".mp3",
              ".wav",
              ".flac",
            ].includes(ext)
          ) {
            mediaFiles.push(fullPath);
          }
        }
      }
    };
    findMediaFiles(mediaDir);
  }
  logger.info("Found media files:", { mediaFiles });
  const mediaArrays = await Promise.all(mediaFiles.map((f) => parseMedia(f)));
  reportData.media = mediaArrays.flat().filter(Boolean);
  logger.info("Parsed media count:", { count: reportData.media.length });

  const browserFiles = loadFilesRecursive(folderPath, "browser_history", ".json");
  logger.info("Found browser files:", { browserFiles });
  const browserArrays = await Promise.all(browserFiles.map((f) => parseBrowserHistory(f)));
  reportData.browserHistory = browserArrays.flat();
  logger.info("Parsed browser history count:", { count: reportData.browserHistory.length });

  const docFiles = loadFilesRecursive(folderPath, "documents");
  const docArrays = await Promise.all(docFiles.map((f) => parseDocuments(f)));
  reportData.documents = docArrays.flat();

  const cryptoFiles = loadFilesRecursive(folderPath, "transactions", ".json");
  logger.info("Found crypto/transaction files:", { cryptoFiles });
  const cryptoArrays = await Promise.all(cryptoFiles.map((f) => parseCrypto(f)));
  reportData.crypto = cryptoArrays.flat();
  logger.info("Parsed crypto count:", { count: reportData.crypto.length });

  const locationFiles = loadFilesRecursive(folderPath, "locations", ".json");
  const locationCsvFiles = loadFilesRecursive(folderPath, "locations", ".csv");
  const allLocationFiles = [...locationFiles, ...locationCsvFiles];
  logger.info("Found location files:", { locationFiles: allLocationFiles });
  const locationArrays = await Promise.all(allLocationFiles.map((f) => parseLocations(f)));
  reportData.locations = locationArrays.flat();
  logger.info("Parsed locations count:", { count: reportData.locations.length });

  const appFiles = loadFilesRecursive(folderPath, "apps", ".json");
  logger.info("Found app files:", { appFiles });
  const appArrays = await Promise.all(appFiles.map((f) => parseApps(f)));
  reportData.apps = appArrays.flat();
  logger.info("Parsed apps count:", { count: reportData.apps.length });

  const deletedDataFiles = loadFilesRecursive(folderPath, "deleted_data", ".json");
  const deletedArrays = await Promise.all(deletedDataFiles.map((f) => parseDeletedData(f)));
  reportData.deletedData = deletedArrays.flat();

  return reportData;
};

export default processUFDRFolder;
