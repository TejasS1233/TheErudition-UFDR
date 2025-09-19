import mongoose from "mongoose";
import neo4j from "neo4j-driver";
import Report from "./models/report.model.js"; // your Mongoose model

// ---------------- CONFIG ----------------
const NEO4J_URI = "neo4j+s://e87bbc36.databases.neo4j.io";
const NEO4J_USER = "e87bbc36";
const NEO4J_PASSWORD = "NZeOfvfyfO4ZR16wy4k-jBNyfVBzBksAeuYphXDei7Q";

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://Tejas:Tejas@cluster0.wnuycfg.mongodb.net";

// ---------------- CONNECTIONS ----------------
await mongoose.connect(MONGO_URI, { dbName: "SIH-UFDR" });
console.log("Connected to MongoDB");

const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));
const session = driver.session();

// ---------------- HELPERS ----------------
const safeDate = (val) => (val ? new Date(val).toISOString() : null);
const safeString = (val, fallback = "unknown") =>
  val !== undefined && val !== null ? val : fallback;
const safeNumber = (val, fallback = 0) => (typeof val === "number" ? val : fallback);

// ---------------- TRANSFER FUNCTION ----------------
async function transferReports() {
  try {
    const reports = await Report.find({}).lean();

    for (const report of reports) {
      const tx = session.beginTransaction();

      // ---------------- REPORT NODE ----------------
      await tx.run(
        `
        MERGE (r:Report {report_id: $report_id})
        SET r.extracted_at = $extracted_at
        `,
        {
          report_id: safeString(report.report_id),
          extracted_at: safeDate(report.source_device?.extracted_at),
        }
      );

      // ---------------- MESSAGES ----------------
      for (const msg of report.messages || []) {
        await tx.run(
          `
          MATCH (r:Report {report_id: $report_id})
          MERGE (m:Message {message_id: $message_id})
          SET m.platform=$platform, m.sender=$sender, m.receiver=$receiver,
              m.timestamp=$timestamp, m.content=$content, m.deleted=$deleted
          MERGE (r)-[:HAS_MESSAGE]->(m)
          `,
          {
            report_id: report.report_id,
            message_id: safeString(msg.message_id, `msg_${Date.now()}`),
            platform: safeString(msg.platform),
            sender: safeString(msg.sender),
            receiver: safeString(msg.receiver),
            timestamp: safeDate(msg.timestamp),
            content: safeString(msg.content, ""),
            deleted: msg.deleted || false,
          }
        );
      }

      // ---------------- CALLS ----------------
      for (const call of report.calls || []) {
        await tx.run(
          `
          MATCH (r:Report {report_id: $report_id})
          MERGE (c:Call {call_id: $call_id})
          SET c.caller=$caller, c.callee=$callee, c.duration=$duration,
              c.call_type=$call_type, c.timestamp=$timestamp, c.deleted=$deleted
          MERGE (r)-[:HAS_CALL]->(c)
          `,
          {
            report_id: report.report_id,
            call_id: safeString(call.call_id, `call_${Date.now()}`),
            caller: safeString(call.caller),
            callee: safeString(call.callee),
            duration: safeNumber(call.duration),
            call_type: safeString(call.call_type, "unknown"),
            timestamp: safeDate(call.timestamp),
            deleted: call.deleted || false,
          }
        );
      }

      // ---------------- MEDIA ----------------
      for (const media of report.media || []) {
        await tx.run(
          `
          MATCH (r:Report {report_id: $report_id})
          MERGE (m:Media {media_id: $media_id})
          SET m.type=$type, m.file_path=$file_path, m.hash=$hash,
              m.timestamp=$timestamp, m.deleted=$deleted, m.metadata=$metadata
          MERGE (r)-[:HAS_MEDIA]->(m)
          `,
          {
            report_id: report.report_id,
            media_id: safeString(media.media_id, `media_${Date.now()}`),
            type: safeString(media.type),
            file_path: safeString(media.file_path),
            hash: safeString(media.hash),
            timestamp: safeDate(media.timestamp),
            deleted: media.deleted || false,
            metadata: media.metadata || {},
          }
        );
      }

      // ---------------- LOCATIONS ----------------
      for (const loc of report.locations || []) {
        await tx.run(
          `
          MATCH (r:Report {report_id: $report_id})
          MERGE (l:Location {location_id: $location_id})
          SET l.source=$source, l.latitude=$lat, l.longitude=$lon,
              l.accuracy=$accuracy, l.timestamp=$timestamp
          MERGE (r)-[:HAS_LOCATION]->(l)
          `,
          {
            report_id: report.report_id,
            location_id: safeString(loc.location_id, `loc_${Date.now()}`),
            source: safeString(loc.source, "unknown"),
            lat: safeNumber(loc.latitude),
            lon: safeNumber(loc.longitude),
            accuracy: safeNumber(loc.accuracy),
            timestamp: safeDate(loc.timestamp),
          }
        );
      }

      // ---------------- BROWSER HISTORY ----------------
      for (const br of report.browserHistory || []) {
        await tx.run(
          `
          MATCH (r:Report {report_id: $report_id})
          MERGE (b:BrowserEntry {history_id: $history_id})
          SET b.browser=$browser, b.url=$url, b.title=$title, b.timestamp=$timestamp
          MERGE (r)-[:HAS_BROWSER_ENTRY]->(b)
          `,
          {
            report_id: report.report_id,
            history_id: safeString(br.history_id, `br_${Date.now()}`),
            browser: safeString(br.browser),
            url: safeString(br.url),
            title: safeString(br.title),
            timestamp: safeDate(br.timestamp),
          }
        );
      }

      // ---------------- DOCUMENTS ----------------
      for (const doc of report.documents || []) {
        await tx.run(
          `
          MATCH (r:Report {report_id: $report_id})
          MERGE (d:Document {file_path: $file_path})
          SET d.content=$content
          MERGE (r)-[:HAS_DOCUMENT]->(d)
          `,
          {
            report_id: report.report_id,
            file_path: safeString(doc.file_path),
            content: safeString(doc.content, ""),
          }
        );
      }

      // ---------------- CONTACTS ----------------
      for (const c of report.contacts || []) {
        await tx.run(
          `
          MATCH (r:Report {report_id: $report_id})
          MERGE (c:Contact {contact_id: $contact_id})
          SET c.name=$name, c.phones=$phones, c.emails=$emails,
              c.relation=$relation, c.groups=$groups
          MERGE (r)-[:HAS_CONTACT]->(c)
          `,
          {
            report_id: report.report_id,
            contact_id: safeString(c.contact_id, `c_${Date.now()}`),
            name: safeString(c.name),
            phones: c.phones || [],
            emails: c.emails || [],
            relation: safeString(c.relation, ""),
            groups: c.groups || [],
          }
        );
      }

      // ---------------- ANALYTICS ----------------
      for (const contact of report.analytics?.most_active_contacts || []) {
        await tx.run(
          `
          MATCH (r:Report {report_id: $report_id})
          MERGE (c:Contact {name: $contact_name})
          MERGE (r)-[:MOST_ACTIVE]->(c)
          `,
          { report_id: report.report_id, contact_name: safeString(contact) }
        );
      }

      for (const flag of report.analytics?.suspicious_activity_flags || []) {
        await tx.run(
          `
          MATCH (r:Report {report_id: $report_id})
          MERGE (f:SuspiciousFlag {description: $desc})
          MERGE (r)-[:HAS_SUSPICIOUS_FLAG]->(f)
          `,
          { report_id: report.report_id, desc: safeString(flag) }
        );
      }

      await tx.commit();
      console.log(`Transferred report ${report.report_id} to Neo4j.`);
    }

    await session.close();
    await driver.close();
    await mongoose.disconnect();
    console.log("All reports transferred successfully!");
  } catch (err) {
    console.error("Error transferring reports:", err);
  }
}

// ---------------- RUN ----------------
transferReports();
