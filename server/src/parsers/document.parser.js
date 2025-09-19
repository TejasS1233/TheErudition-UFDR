import textract from "textract";

export const parseDocuments = (filePath) =>
  new Promise((resolve, reject) => {
    textract.fromFileWithPath(filePath, (err, text) => {
      if (err) {
        console.error(`Error parsing document ${filePath}:`, err);
        // Resolve with an empty content string to avoid breaking the chain
        resolve({ content: "", file_path: filePath, error: err.message });
      } else {
        resolve({ content: text, file_path: filePath });
      }
    });
  });
