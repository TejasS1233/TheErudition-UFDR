import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";

export const parseMedia = async (filePath) => {
  const ext = filePath.split(".").pop().toLowerCase();

  if (["jpg", "jpeg", "png", "gif", "webp", "tiff"].includes(ext)) {
    try {
      const metadata = await sharp(filePath).metadata();
      return {
        media_id: filePath,
        type: "image",
        file_path: filePath,
        metadata: metadata,
        timestamp: new Date(),
      };
    } catch (error) {
      console.warn(`Skipping invalid image file ${filePath}: ${error.message}`);
      return null;
    }
  } else if (["mp4", "mov", "avi", "mkv", "mp3", "wav", "flac"].includes(ext)) {
    return new Promise((resolve) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          console.warn(`Skipping invalid media file ${filePath}: ${err.message}`);
          resolve(null);
        } else {
          resolve({
            media_id: filePath,
            type: ["mp3", "wav", "flac"].includes(ext) ? "audio" : "video",
            file_path: filePath,
            metadata: metadata.format,
            timestamp: new Date(),
          });
        }
      });
    });
  } else {
    console.warn(`Skipping unsupported media file type: ${filePath}`);
    return null;
  }
};
