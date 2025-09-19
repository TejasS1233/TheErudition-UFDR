import fs from "fs";

export const parseCrypto = (filePath) => {
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const cryptoData = JSON.parse(fileContent);
    return cryptoData.map((item) => ({
      ...item,
      file_path: filePath,
    }));
  } catch (error) {
    console.error(`Error parsing crypto file ${filePath}:`, error);
    return [];
  }
};
