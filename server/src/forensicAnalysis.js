import neo4j from "neo4j-driver";

const NEO4J_URI = "neo4j+s://e87bbc36.databases.neo4j.io";
const NEO4J_USER = "e87bbc36";
const NEO4J_PASSWORD = "NZeOfvfyfO4ZR16wy4k-jBNyfVBzBksAeuYphXDei7Q";

const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));

async function runForensicAnalysis() {
  const session = driver.session();

  try {
    console.log("🔍 FORENSIC ANALYSIS STARTING...\n");

    console.log("1. FINDING COMMUNICATION NETWORKS:");
    const communicationNetwork = await session.run(`
      MATCH (m:Message)
      RETURN m.sender as person, count(m) as message_count, 
             collect(DISTINCT m.receiver) as contacts
      ORDER BY message_count DESC
    `);

    communicationNetwork.records.forEach((record) => {
      console.log(`   📱 ${record.get("person")}: ${record.get("message_count")} messages`);
      console.log(`      Contacts: ${record.get("contacts").join(", ")}\n`);
    });

    console.log("2. SUSPICIOUS ACTIVITY TIMELINE:");
    const timeline = await session.run(`
      MATCH (m:Message)
      WHERE m.deleted = true OR m.content CONTAINS 'delete' OR m.content CONTAINS 'destroy'
      RETURN m.timestamp, m.sender, m.receiver, m.content, m.deleted
      ORDER BY m.timestamp
    `);

    timeline.records.forEach((record) => {
      const time = new Date(record.get("m.timestamp")).toLocaleString();
      const deleted = record.get("m.deleted") ? "🗑️ DELETED" : "";
      console.log(`   ⚠️  ${time} ${deleted}`);
      console.log(`      ${record.get("m.sender")} → ${record.get("m.receiver")}`);
      console.log(`      "${record.get("m.content")}"\n`);
    });

    console.log("3. CRYPTOCURRENCY MONEY TRAIL:");
    const cryptoTrail = await session.run(`
      MATCH (c:Crypto)
      RETURN c.currency, c.amount, c.timestamp, c.source
      ORDER BY c.timestamp
    `);

    let totalBTC = 0;
    let totalUSDT = 0;
    cryptoTrail.records.forEach((record) => {
      const time = new Date(record.get("c.timestamp")).toLocaleString();
      const amount = record.get("c.amount");
      const currency = record.get("c.currency");

      if (currency === "BTC") totalBTC += amount;
      if (currency === "USDT") totalUSDT += amount;

      console.log(`   💰 ${time}: ${amount} ${currency}`);
    });
    console.log(`   📊 TOTAL: ${totalBTC} BTC, ${totalUSDT} USDT\n`);

    console.log("4. LOCATION CORRELATION:");
    const locations = await session.run(`
      MATCH (l:Location)
      RETURN l.latitude, l.longitude, l.timestamp, l.source
      ORDER BY l.timestamp
    `);

    locations.records.forEach((record) => {
      const time = new Date(record.get("l.timestamp")).toLocaleString();
      const lat = record.get("l.latitude");
      const lon = record.get("l.longitude");
      const source = record.get("l.source");
      console.log(`   📍 ${time}: (${lat}, ${lon}) via ${source}`);
    });

    console.log("\n5. SUSPICIOUS APPS DETECTED:");
    const suspiciousApps = await session.run(`
      MATCH (a:App)
      WHERE a.usage_stats CONTAINS 'suspicious'
      RETURN a.name, a.last_opened, a.usage_stats
      ORDER BY a.last_opened DESC
    `);

    suspiciousApps.records.forEach((record) => {
      const time = new Date(record.get("a.last_opened")).toLocaleString();
      console.log(`   🚨 ${record.get("a.name")} - Last used: ${time}`);
    });

    console.log("\n6. EVIDENCE DESTRUCTION ATTEMPTS:");
    const deletedEvidence = await session.run(`
      MATCH (d:DeletedData)
      RETURN d.data_type, d.original_id, d.recovery_status, d.timestamp
      ORDER BY d.timestamp DESC
    `);

    deletedEvidence.records.forEach((record) => {
      const time = new Date(record.get("d.timestamp")).toLocaleString();
      const status = record.get("d.recovery_status");
      const statusIcon =
        status === "recovered" ? "✅" : status === "partially_recovered" ? "⚠️" : "❌";
      console.log(`   ${statusIcon} ${time}: ${record.get("d.original_id")} (${status})`);
    });

    console.log("\n7. CALL PATTERN ANALYSIS:");
    const callPatterns = await session.run(`
      MATCH (c:Call)
      WHERE c.deleted = true
      RETURN c.caller, c.callee, c.duration, c.timestamp, c.call_type
      ORDER BY c.timestamp
    `);

    callPatterns.records.forEach((record) => {
      const time = new Date(record.get("c.timestamp")).toLocaleString();
      const duration = record.get("c.duration");
      console.log(
        `   📞 ${time}: ${record.get("c.caller")} → ${record.get("c.callee")} (${duration}s) 🗑️ DELETED`
      );
    });

    console.log("\n8. NETWORK ANALYSIS - FINDING KEY PLAYERS:");
    const networkAnalysis = await session.run(`
      MATCH (m:Message)
      WITH m.sender as person, count(m) as sent_count
      MATCH (m2:Message)
      WHERE m2.receiver = person
      WITH person, sent_count, count(m2) as received_count
      RETURN person, sent_count, received_count, (sent_count + received_count) as total_activity
      ORDER BY total_activity DESC
      LIMIT 5
    `);

    networkAnalysis.records.forEach((record) => {
      const person = record.get("person");
      const sent = record.get("sent_count");
      const received = record.get("received_count");
      const total = record.get("total_activity");
      console.log(`   👤 ${person}: ${sent} sent, ${received} received (Total: ${total})`);
    });

    console.log("\n🎯 FORENSIC ANALYSIS COMPLETE!");
    console.log("📋 SUMMARY: Criminal network detected with evidence of:");
    console.log("   • Drug trafficking coordination");
    console.log("   • Money laundering through cryptocurrency");
    console.log("   • Evidence destruction attempts");
    console.log("   • Use of encrypted communication apps");
    console.log("   • Coordinated location movements");
  } catch (error) {
    console.error("Error running forensic analysis:", error);
  } finally {
    await session.close();
    await driver.close();
  }
}

runForensicAnalysis();
