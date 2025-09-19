import fs from "fs";

export const parseMessages = (filePath) => {
  const raw = fs.readFileSync(filePath, "utf-8");
  let messages = [];
  try {
    const data = JSON.parse(raw);
    data.forEach((msg) => {
      messages.push({
        message_id: msg.id,
        sender: msg.sender,
        receiver: msg.receiver,
        platform: msg.platform,
        content: msg.text,
        timestamp: new Date(msg.timestamp),
        attachments: msg.attachments || [],
        deleted: msg.deleted || false,
      });
    });
  } catch (err) {
    console.error("Error parsing messages:", err);
  }
  return messages;
};
