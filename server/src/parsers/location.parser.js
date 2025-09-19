import fs from "fs";

export const parseLocations = (filePath) => {
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const locations = JSON.parse(fileContent);
    return locations.map((item) => ({
      ...item,
      file_path: filePath,
    }));
  } catch (error) {
    console.error(`Error parsing location file ${filePath}:`, error);
    return [];
  }
};
