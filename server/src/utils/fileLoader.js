import fs from "fs";
import path from "path";

const findDir = (startPath, filter) => {
  const files = fs.readdirSync(startPath);
  for (let i = 0; i < files.length; i++) {
    const filename = path.join(startPath, files[i]);
    const stat = fs.lstatSync(filename);
    if (stat.isDirectory() && files[i] === filter) {
      return filename;
    } else if (stat.isDirectory()) {
      const result = findDir(filename, filter);
      if (result) {
        return result;
      }
    }
  }
};

export const loadFiles = (dir, ext = null) => {
  if (!fs.existsSync(dir)) {
    return [];
  }
  let files = fs.readdirSync(dir).map((f) => path.join(dir, f));
  if (ext) files = files.filter((f) => f.endsWith(ext));
  return files;
};

export const loadFilesRecursive = (startPath, dirName, ext = null) => {
  const dir = findDir(startPath, dirName);
  if (dir) {
    return loadFiles(dir, ext);
  }
  return [];
};
