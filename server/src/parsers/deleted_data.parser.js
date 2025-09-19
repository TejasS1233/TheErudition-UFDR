import fs from "fs";

export const parseDeletedData = (filePath) => {
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const deletedData = JSON.parse(fileContent);
    return deletedData.map((item) => ({
      ...item,
      file_path: filePath,
    }));
  } catch (error) {
    console.error(`Error parsing deleted data file ${filePath}:`, error);
    return [];
  }
};
