import neo4j from "neo4j-driver";

const NEO4J_URI = "neo4j+s://e87bbc36.databases.neo4j.io";
const NEO4J_USER = "e87bbc36";
const NEO4J_PASSWORD = "NZeOfvfyfO4ZR16wy4k-jBNyfVBzBksAeuYphXDei7Q";

const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));

async function runPowerfulForensicAnalysis() {
  const session = driver.session();

  try {
    console.log("🔥 POWERFUL NEO4J FORENSIC ANALYSIS - REAL INTERCONNECTIONS!");
    console.log("=".repeat(80));

    console.log("\n🔗 1. CREATING PERSON-TO-PERSON CONNECTIONS:");
    await session.run(`
      MATCH (m:Message)
      MERGE (sender:Person {name: m.sender})
      MERGE (receiver:Person {name: m.receiver})
      MERGE (sender)-[r:MESSAGED {platform: m.platform, timestamp: m.timestamp, deleted: m.deleted}]->(receiver)
      SET r.content = m.content
    `);

    await session.run(`
      MATCH (c:Call)
      MERGE (caller:Person {phone: c.caller})
      MERGE (callee:Person {phone: c.callee})
      MERGE (caller)-[r:CALLED {duration: c.duration, timestamp: c.timestamp, deleted: c.deleted}]->(callee)
    `);

    console.log("   ✅ Person connections created from messages and calls");

    console.log("\n💰 2. CREATING CRYPTO WALLET CONNECTIONS:");
    await session.run(`
      MATCH (cr:Crypto)
      MERGE (from_wallet:Wallet {address: cr.from_user})
      MERGE (to_wallet:Wallet {address: cr.to_user})
      MERGE (from_wallet)-[r:TRANSFERRED {amount: cr.amount, currency: cr.currency, timestamp: cr.timestamp}]->(to_wallet)
    `);

    console.log("   ✅ Wallet transfer connections created");

    console.log("\n📍 3. LINKING PEOPLE TO LOCATIONS:");
    await session.run(`
      MATCH (l:Location), (m:Message)
      WHERE abs(duration.between(datetime(l.timestamp), datetime(m.timestamp)).minutes) < 15
      MERGE (p:Person {name: m.sender})
      MERGE (p)-[r:WAS_AT {timestamp: l.timestamp, accuracy: l.accuracy, source: l.source}]->(l)
    `);

    console.log("   ✅ Person-location connections created");

    console.log("\n🌐 4. CONNECTING BROWSER ACTIVITY TO WALLETS:");
    await session.run(`
      MATCH (b:BrowserEntry), (w:Wallet)
      WHERE b.url CONTAINS w.address
      MERGE (w)-[r:SEARCHED_ONLINE {timestamp: b.timestamp, browser: b.browser}]->(b)
    `);

    console.log("   ✅ Wallet-browser connections created");

    console.log("\n🕵️ 5. FINDING MULTI-HOP CRIMINAL NETWORKS:");
    const criminalNetwork = await session.run(`
      MATCH path = (p1:Person)-[:MESSAGED|CALLED*1..3]-(p2:Person)
      WHERE p1.name = "John Smith" AND p2.name <> "John Smith"
      RETURN p1.name as start, p2.name as end, 
             [rel in relationships(path) | type(rel)] as connection_types,
             length(path) as degrees
      ORDER BY degrees
    `);

    criminalNetwork.records.forEach((record) => {
      const start = record.get("start");
      const end = record.get("end");
      const types = record.get("connection_types").join(" → ");
      const degrees = record.get("degrees");
      console.log(`   🔗 ${degrees}-hop: ${start} → ${end} via [${types}]`);
    });

    console.log("\n💸 6. TRACING MONEY FLOW THROUGH MULTIPLE WALLETS:");
    const moneyFlow = await session.run(`
      MATCH path = (w1:Wallet)-[:TRANSFERRED*1..5]->(w2:Wallet)
      WHERE w1.address = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
      RETURN [wallet in nodes(path) | wallet.address] as wallet_chain,
             [rel in relationships(path) | rel.amount] as amounts,
             length(path) as hops
      ORDER BY hops DESC
      LIMIT 5
    `);

    moneyFlow.records.forEach((record) => {
      const wallets = record.get("wallet_chain");
      const amounts = record.get("amounts");
      const hops = record.get("hops");
      console.log(`   💰 ${hops}-hop money trail:`);
      for (let i = 0; i < wallets.length - 1; i++) {
        console.log(
          `      ${wallets[i].substring(0, 10)}... → ${wallets[i + 1].substring(0, 10)}... (${amounts[i]} BTC)`
        );
      }
    });

    console.log("\n📍 7. CORRELATING LOCATIONS WITH COMMUNICATIONS:");
    const locationCorrelation = await session.run(`
      MATCH (p:Person)-[r1:WAS_AT]->(l:Location),
            (p)-[r2:MESSAGED]->(p2:Person)
      WHERE abs(duration.between(datetime(r1.timestamp), datetime(r2.timestamp)).minutes) < 30
      RETURN p.name, p2.name, l.latitude, l.longitude, 
             r1.timestamp as location_time, r2.timestamp as message_time,
             duration.between(datetime(r1.timestamp), datetime(r2.timestamp)).minutes as time_diff
      ORDER BY abs(time_diff)
      LIMIT 10
    `);

    locationCorrelation.records.forEach((record) => {
      const timeDiff = record.get("time_diff");
      const lat = record.get("l.latitude");
      const lon = record.get("l.longitude");
      const locTime = new Date(record.get("location_time")).toLocaleTimeString();
      const msgTime = new Date(record.get("message_time")).toLocaleTimeString();
      console.log(
        `   📍 ${record.get("p.name")} at (${lat}, ${lon}) ${locTime} → messaged ${record.get("p2.name")} ${msgTime} (${timeDiff}min diff)`
      );
    });

    console.log("\n🚨 8. DETECTING COORDINATED EVIDENCE DESTRUCTION:");
    const evidenceDestruction = await session.run(`
      MATCH (p:Person)-[r:MESSAGED]->(p2:Person),
            (d:DeletedData)
      WHERE r.deleted = true AND 
            abs(duration.between(datetime(r.timestamp), datetime(d.timestamp)).minutes) < 10
      RETURN p.name, p2.name, r.content, d.original_id, d.recovery_status,
             r.timestamp as message_time, d.timestamp as deletion_time
      ORDER BY message_time
    `);

    evidenceDestruction.records.forEach((record) => {
      const msgTime = new Date(record.get("message_time")).toLocaleTimeString();
      const delTime = new Date(record.get("deletion_time")).toLocaleTimeString();
      console.log(
        `   🗑️ ${record.get("p.name")} → ${record.get("p2.name")} (${msgTime}): "${record.get("r.content")}"`
      );
      console.log(
        `      📁 File deleted (${delTime}): ${record.get("d.original_id")} (${record.get("d.recovery_status")})`
      );
    });

    console.log("\n🎯 9. CRIMINAL ORGANIZATION HIERARCHY ANALYSIS:");
    const hierarchy = await session.run(`
      MATCH (p:Person)
      OPTIONAL MATCH (p)-[out:MESSAGED|CALLED]->(others:Person)
      OPTIONAL MATCH (p)<-[in:MESSAGED|CALLED]-(others2:Person)
      WITH p, count(DISTINCT out) as outgoing, count(DISTINCT in) as incoming,
           count(DISTINCT others) + count(DISTINCT others2) as total_connections
      WHERE total_connections > 0
      WITH p, outgoing, incoming, total_connections,
           CASE 
             WHEN outgoing > incoming THEN 'LEADER'
             WHEN incoming > outgoing THEN 'FOLLOWER'
             ELSE 'COORDINATOR'
           END as role,
           (outgoing * 2 + total_connections) as influence_score
      RETURN p.name, role, influence_score, outgoing, incoming, total_connections
      ORDER BY influence_score DESC
    `);

    hierarchy.records.forEach((record) => {
      const role = record.get("role");
      const roleIcon = role === "LEADER" ? "👑" : role === "FOLLOWER" ? "👤" : "🔄";
      const name = record.get("p.name");
      const score = record.get("influence_score");
      const out = record.get("outgoing");
      const inc = record.get("incoming");
      console.log(`   ${roleIcon} ${name}: ${role} (Influence: ${score}, Out: ${out}, In: ${inc})`);
    });

    console.log("\n⚡ 10. REAL-TIME THREAT ASSESSMENT WITH CONNECTIONS:");
    const threatAssessment = await session.run(`
      MATCH (p:Person)
      OPTIONAL MATCH (p)-[:MESSAGED|CALLED]-(connected:Person)
      OPTIONAL MATCH (p)-[:WAS_AT]->(l:Location)
      OPTIONAL MATCH (w:Wallet)-[:SEARCHED_ONLINE]->(b:BrowserEntry)
      WITH p, count(DISTINCT connected) as connections,
           count(DISTINCT l) as locations_visited,
           count(DISTINCT w) as wallets_searched,
           count(DISTINCT b) as browser_activities
      WHERE connections > 0
      WITH p, connections, locations_visited, wallets_searched, browser_activities,
           (connections * 3 + locations_visited * 2 + wallets_searched * 5 + browser_activities * 1) as threat_score
      RETURN p.name, threat_score, connections, locations_visited, wallets_searched, browser_activities
      ORDER BY threat_score DESC
    `);

    threatAssessment.records.forEach((record) => {
      const score = record.get("threat_score");
      const name = record.get("p.name");
      const riskLevel = score > 20 ? "🔴 EXTREME" : score > 10 ? "🟡 HIGH" : "🟢 MEDIUM";
      console.log(`   ${riskLevel}: ${name} (Score: ${score})`);
      console.log(
        `      🔗 Connections: ${record.get("connections")}, 📍 Locations: ${record.get("locations_visited")}`
      );
      console.log(
        `      💰 Wallets: ${record.get("wallets_searched")}, 🌐 Browser: ${record.get("browser_activities")}`
      );
    });

    console.log("\n🕸️ 11. COMPLETE EVIDENCE NETWORK VISUALIZATION:");
    const networkStats = await session.run(`
      MATCH (n)
      WITH labels(n)[0] as node_type, count(n) as count
      RETURN node_type, count
      ORDER BY count DESC
    `);

    console.log("   📊 NETWORK COMPOSITION:");
    networkStats.records.forEach((record) => {
      const type = record.get("node_type");
      const count = record.get("count");
      const icon =
        type === "Person" ? "👤" : type === "Wallet" ? "💰" : type === "Location" ? "📍" : "📄";
      console.log(`      ${icon} ${type}: ${count} nodes`);
    });

    const relationshipStats = await session.run(`
      MATCH ()-[r]->()
      WITH type(r) as rel_type, count(r) as count
      RETURN rel_type, count
      ORDER BY count DESC
    `);

    console.log("   🔗 RELATIONSHIP TYPES:");
    relationshipStats.records.forEach((record) => {
      const type = record.get("rel_type");
      const count = record.get("count");
      console.log(`      → ${type}: ${count} connections`);
    });

    console.log("\n" + "=".repeat(80));
    console.log("🎯 NEO4J GRAPH DATABASE ADVANTAGES DEMONSTRATED:");
    console.log("✅ Multi-hop relationship traversal (finding connections 2-3 degrees apart)");
    console.log("✅ Real-time pattern matching across different data types");
    console.log("✅ Dynamic relationship creation between entities");
    console.log("✅ Complex temporal correlation analysis");
    console.log("✅ Network topology analysis (leaders, followers, coordinators)");
    console.log("✅ Money flow tracing through multiple intermediaries");
    console.log("✅ Evidence destruction pattern detection");
    console.log("✅ Location-communication-crypto correlation");
    console.log("✅ Threat scoring based on network position");
    console.log("✅ Complete criminal network reconstruction");

    console.log("\n❌ IMPOSSIBLE WITH MONGODB:");
    console.log("   • No native graph traversal or path finding");
    console.log("   • Complex multi-collection joins required");
    console.log("   • No relationship-based queries");
    console.log("   • Manual network analysis implementation needed");
    console.log("   • No built-in graph algorithms");
    console.log("   • Difficult temporal relationship correlation");

    console.log("\n🚀 RESULT: Complete criminal network mapped with all interconnections!");
  } catch (error) {
    console.error("Error running forensic analysis:", error);
  } finally {
    await session.close();
    await driver.close();
  }
}

runPowerfulForensicAnalysis();
