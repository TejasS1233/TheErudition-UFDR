import fs from "fs";

export const parseApps = (filePath) => {
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const apps = JSON.parse(fileContent);
    return apps.map((app) => ({
      ...app,
      file_path: filePath,
    }));
  } catch (error) {
    console.error(`Error parsing app file ${filePath}:`, error);
    return [];
  }
};
