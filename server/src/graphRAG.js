import neo4j from "neo4j-driver";

const NEO4J_URI = "neo4j+s://e87bbc36.databases.neo4j.io";
const NEO4J_USER = "e87bbc36";
const NEO4J_PASSWORD = "NZeOfvfyfO4ZR16wy4k-jBNyfVBzBksAeuYphXDei7Q";

const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));

async function graphRAGQuery(question) {
  const session = driver.session();
  console.log(`\n🕸️ GRAPH RAG QUERY: "${question}"`);
  console.log("=".repeat(60));

  try {
    if (question.includes("John Smith connected")) {
      console.log("🔗 FINDING ALL CONNECTIONS TO JOHN SMITH:");

      // Direct connections
      const directConnections = await session.run(`
        MATCH (john:Person {name: "John Smith"})-[r]-(connected)
        RETURN connected.name as name, type(r) as relationship, r.timestamp as time
        ORDER BY time DESC
      `);

      console.log("   📱 DIRECT CONNECTIONS:");
      directConnections.records.forEach((record) => {
        const name = record.get("name");
        const rel = record.get("relationship");
        const time = new Date(record.get("time")).toLocaleTimeString();
        console.log(`      ${name} via ${rel} at ${time}`);
      });

      // 2-hop connections (friends of friends)
      const secondDegree = await session.run(`
        MATCH (john:Person {name: "John Smith"})-[r1]-(friend)-[r2]-(friend_of_friend)
        WHERE friend_of_friend.name <> "John Smith"
        RETURN DISTINCT friend_of_friend.name as name, friend.name as through,
               type(r1) as rel1, type(r2) as rel2
        LIMIT 10
      `);

      console.log("   🔗 2-HOP CONNECTIONS (Friends of Friends):");
      secondDegree.records.forEach((record) => {
        const name = record.get("name");
        const through = record.get("through");
        const rel1 = record.get("rel1");
        const rel2 = record.get("rel2");
        console.log(`      ${name} through ${through} (${rel1} → ${rel2})`);
      });

      // Shared locations
      const sharedLocations = await session.run(`
        MATCH (john:Person {name: "John Smith"})-[:WAS_AT]->(loc:Location)<-[:WAS_AT]-(other:Person)
        WHERE other.name <> "John Smith"
        RETURN other.name as person, loc.latitude as lat, loc.longitude as lon,
               count(*) as times_together
        ORDER BY times_together DESC
      `);

      console.log("   📍 PEOPLE AT SAME LOCATIONS:");
      sharedLocations.records.forEach((record) => {
        const person = record.get("person");
        const lat = record.get("lat");
        const lon = record.get("lon");
        const times = record.get("times_together");
        console.log(`      ${person} at (${lat}, ${lon}) - ${times} times together`);
      });
    }

    if (question.includes("money flow") || question.includes("crypto trail")) {
      console.log("💰 TRACING COMPLETE MONEY FLOW:");

      const moneyTrail = await session.run(`
        MATCH path = (start:Wallet)-[:TRANSFERRED*1..5]->(end:Wallet)
        WHERE start.address CONTAINS "bc1qxy2k"
        RETURN [wallet in nodes(path) | wallet.address] as wallet_chain,
               [rel in relationships(path) | rel.amount + " " + rel.currency] as amounts,
               [rel in relationships(path) | rel.timestamp] as timestamps
        ORDER BY length(path) DESC
        LIMIT 3
      `);

      console.log("   💸 COMPLETE MONEY TRAILS:");
      moneyTrail.records.forEach((record, i) => {
        const wallets = record.get("wallet_chain");
        const amounts = record.get("amounts");
        const times = record.get("timestamps");

        console.log(`   Trail ${i + 1}:`);
        for (let j = 0; j < wallets.length - 1; j++) {
          const time = new Date(times[j]).toLocaleTimeString();
          console.log(
            `      ${wallets[j].substring(0, 15)}... → ${wallets[j + 1].substring(0, 15)}...`
          );
          console.log(`      Amount: ${amounts[j]} at ${time}`);
        }
      });

      // Who controls these wallets?
      const walletOwners = await session.run(`
        MATCH (w:Wallet)-[:SEARCHED_ONLINE]->(b:BrowserEntry)
        MATCH (m:Message)
        WHERE m.content CONTAINS w.address
        RETURN w.address as wallet, m.sender as likely_owner, count(*) as mentions
        ORDER BY mentions DESC
      `);

      console.log("   👤 WALLET OWNERSHIP:");
      walletOwners.records.forEach((record) => {
        const wallet = record.get("wallet");
        const owner = record.get("likely_owner");
        const mentions = record.get("mentions");
        console.log(
          `      ${wallet.substring(0, 20)}... likely owned by ${owner} (${mentions} mentions)`
        );
      });
    }

    if (question.includes("criminal network") || question.includes("organization")) {
      console.log("🕸️ MAPPING CRIMINAL ORGANIZATION:");

      const networkStructure = await session.run(`
        MATCH (p:Person)
        OPTIONAL MATCH (p)-[out:MESSAGED|CALLED]->(others)
        OPTIONAL MATCH (p)<-[in:MESSAGED|CALLED]-(others2)
        WITH p, count(out) as commands_sent, count(in) as orders_received,
             collect(DISTINCT others.name) as contacts_commanded,
             collect(DISTINCT others2.name) as commanders
        WHERE commands_sent > 0 OR orders_received > 0
        RETURN p.name as person, commands_sent, orders_received,
               CASE 
                 WHEN commands_sent > orders_received THEN "LEADER"
                 WHEN orders_received > commands_sent THEN "FOLLOWER" 
                 ELSE "COORDINATOR"
               END as role,
               contacts_commanded, commanders
        ORDER BY commands_sent DESC
      `);

      console.log("   👑 ORGANIZATIONAL HIERARCHY:");
      networkStructure.records.forEach((record) => {
        const person = record.get("person");
        const role = record.get("role");
        const sent = record.get("commands_sent");
        const received = record.get("orders_received");
        const roleIcon = role === "LEADER" ? "👑" : role === "FOLLOWER" ? "👤" : "🔄";

        console.log(`      ${roleIcon} ${person}: ${role} (Sent: ${sent}, Received: ${received})`);

        const commanded = record.get("contacts_commanded");
        const commanders = record.get("commanders");
        if (commanded.length > 0) {
          console.log(`         Commands: ${commanded.join(", ")}`);
        }
        if (commanders.length > 0) {
          console.log(`         Reports to: ${commanders.join(", ")}`);
        }
      });
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await session.close();
  }
}

// Test Graph RAG
await graphRAGQuery("Who is John Smith connected to?");
await graphRAGQuery("Show me the complete crypto money trail");
await graphRAGQuery("Map the criminal network organization");

await driver.close();
