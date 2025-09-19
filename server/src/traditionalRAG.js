import mongoose from "mongoose";
import Report from "./models/report.model.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://Tejas:Tejas@cluster0.wnuycfg.mongodb.net";

await mongoose.connect(MONGO_URI, { dbName: "SIH-UFDR" });

async function traditionalRAGQuery(question) {
  console.log(`\n🔍 TRADITIONAL RAG QUERY: "${question}"`);
  console.log("=".repeat(60));

  try {
    if (question.includes("John Smith")) {
      const reports = await Report.find({
        $or: [
          { "messages.sender": "John Smith" },
          { "messages.receiver": "John Smith" },
          { "calls.caller": { $regex: "555-1001" } },
          { "calls.callee": { $regex: "555-1001" } },
        ],
      });

      console.log("📄 FOUND DOCUMENTS MENTIONING 'John Smith':");
      reports.forEach((report) => {
        const messages = report.messages.filter(
          (m) => m.sender === "John Smith" || m.receiver === "John Smith"
        );
        messages.forEach((msg) => {
          console.log(`   💬 Message: ${msg.sender} → ${msg.receiver}: "${msg.content}"`);
        });
      });

      console.log("\n❌ TRADITIONAL RAG LIMITATIONS:");
      console.log("   • Cannot find WHO ELSE is connected to John Smith");
      console.log("   • Cannot trace money flow through multiple people");
      console.log("   • Cannot find location patterns across the network");
      console.log("   • Each search is isolated - no relationship context");
    }

    if (question.includes("money flow") || question.includes("crypto")) {
      const reports = await Report.find({
        crypto: { $exists: true, $ne: [] },
      });

      console.log("💰 FOUND CRYPTO TRANSACTIONS:");
      reports.forEach((report) => {
        report.crypto.forEach((crypto) => {
          console.log(`   ${crypto.amount} ${crypto.currency} at ${crypto.timestamp}`);
        });
      });

      console.log("\n❌ TRADITIONAL RAG LIMITATIONS:");
      console.log("   • Cannot trace WHO sent/received the crypto");
      console.log("   • Cannot connect crypto to messages or calls");
      console.log("   • Cannot find the complete money trail");
      console.log("   • No understanding of wallet relationships");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

await traditionalRAGQuery("Who is John Smith connected to?");
await traditionalRAGQuery("Show me the money flow in this case");

await mongoose.disconnect();
