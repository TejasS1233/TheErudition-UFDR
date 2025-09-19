import fs from "fs";

export const parseBrowserHistory = (filePath) => {
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const history = JSON.parse(fileContent);
    return history.map((item) => ({
      ...item,
      file_path: filePath,
    }));
  } catch (error) {
    console.error(`Error parsing browser history file ${filePath}:`, error);
    return [];
  }
};
