import fs from "fs";

export const parseCalls = (filePath) => {
  const raw = fs.readFileSync(filePath, "utf-8");
  let calls = [];
  try {
    const data = JSON.parse(raw);
    data.forEach((call) => {
      calls.push({
        call_id: call.id,
        caller: call.caller,
        callee: call.callee,
        duration: call.duration,
        call_type: call.type,
        timestamp: new Date(call.timestamp),
        deleted: call.deleted || false,
      });
    });
  } catch (err) {
    console.error("Error parsing calls:", err);
  }
  return calls;
};
