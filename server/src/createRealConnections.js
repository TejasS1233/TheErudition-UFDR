import neo4j from "neo4j-driver";

const NEO4J_URI = "neo4j+s://e87bbc36.databases.neo4j.io";
const NEO4J_USER = "e87bbc36";
const NEO4J_PASSWORD = "NZeOfvfyfO4ZR16wy4k-jBNyfVBzBksAeuYphXDei7Q";

const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));

async function createRealConnections() {
  const session = driver.session();

  try {
    console.log("🔗 CREATING REAL VISIBLE CONNECTIONS IN NEO4J...");

    // 1. Create Person nodes and connect them through messages
    console.log("👥 Creating Person nodes and message relationships...");
    await session.run(`
      MATCH (m:Message)
      WHERE m.sender IS NOT NULL AND m.receiver IS NOT NULL
      MERGE (sender:Person {name: m.sender})
      MERGE (receiver:Person {name: m.receiver})
      MERGE (sender)-[r:SENT_MESSAGE {
        content: coalesce(m.content, ""),
        platform: coalesce(m.platform, "unknown"),
        timestamp: m.timestamp,
        deleted: coalesce(m.deleted, false)
      }]->(receiver)
    `);

    // 2. Create Phone nodes and connect to people
    console.log("📞 Creating Phone nodes and call relationships...");
    await session.run(`
      MATCH (c:Call)
      WHERE c.caller IS NOT NULL AND c.callee IS NOT NULL
      MERGE (caller_phone:Phone {number: c.caller})
      MERGE (callee_phone:Phone {number: c.callee})
      MERGE (caller_phone)-[r:CALLED {
        duration: coalesce(c.duration, 0),
        call_type: coalesce(c.call_type, "unknown"),
        timestamp: c.timestamp,
        deleted: coalesce(c.deleted, false)
      }]->(callee_phone)
    `);

    // 3. Connect phones to people based on user profile
    console.log("🔗 Connecting phones to people...");
    await session.run(`
      MATCH (u:UserProfile), (phone:Phone)
      WHERE u.name IS NOT NULL AND phone.number IS NOT NULL AND phone.number IN u.phones
      MERGE (person:Person {name: u.name})
      MERGE (person)-[:OWNS_PHONE]->(phone)
    `);

    // 4. Create Wallet nodes and money flow
    console.log("💰 Creating Wallet nodes and transfer relationships...");
    await session.run(`
      MATCH (c:Crypto)
      MERGE (from_wallet:Wallet {address: c.from_user})
      MERGE (to_wallet:Wallet {address: c.to_user})
      MERGE (from_wallet)-[r:TRANSFERRED {
        amount: c.amount,
        currency: c.currency,
        timestamp: c.timestamp
      }]->(to_wallet)
    `);

    // 5. Connect wallets to people based on message content
    console.log("🔗 Connecting wallets to people...");
    await session.run(`
      MATCH (m:Message), (w:Wallet)
      WHERE m.content CONTAINS w.address
      MERGE (sender:Person {name: m.sender})
      MERGE (sender)-[:CONTROLS_WALLET {mentioned_in_message: m.message_id}]->(w)
    `);

    // 6. Create Location nodes and connect to people
    console.log("📍 Creating Location nodes and presence relationships...");
    await session.run(`
      MATCH (l:Location)
      MERGE (loc:Place {coordinates: toString(l.latitude) + "," + toString(l.longitude)})
      SET loc.latitude = l.latitude, loc.longitude = l.longitude
      
      MATCH (m:Message), (loc:Place)
      WHERE m.content CONTAINS loc.coordinates
      MERGE (sender:Person {name: m.sender})
      MERGE (sender)-[:WAS_AT {timestamp: m.timestamp, mentioned_in: m.message_id}]->(loc)
    `);

    // 7. Connect people to apps they use
    console.log("📱 Connecting people to apps...");
    await session.run(`
      MATCH (a:App), (m:Message)
      WHERE m.platform = a.name OR 
            (a.name CONTAINS "Signal" AND m.platform = "Signal") OR
            (a.name CONTAINS "Telegram" AND m.platform = "Telegram") OR
            (a.name CONTAINS "WhatsApp" AND m.platform = "WhatsApp")
      MERGE (sender:Person {name: m.sender})
      MERGE (sender)-[:USES_APP {last_message: m.timestamp}]->(a)
    `);

    // 8. Create evidence destruction connections
    console.log("🗑️ Creating evidence destruction relationships...");
    await session.run(`
      MATCH (d:DeletedData), (m:Message)
      WHERE m.deleted = true AND 
            abs(duration.between(datetime(m.timestamp), datetime(d.timestamp)).minutes) < 30
      MERGE (person:Person {name: m.sender})
      MERGE (person)-[:DESTROYED_EVIDENCE {
        time_difference_minutes: duration.between(datetime(m.timestamp), datetime(d.timestamp)).minutes
      }]->(d)
    `);

    // 9. Create browser activity connections
    console.log("🌐 Creating browser activity relationships...");
    await session.run(`
      MATCH (b:BrowserEntry), (w:Wallet)
      WHERE b.url CONTAINS w.address
      MERGE (w)-[:SEARCHED_ONLINE {
        timestamp: b.timestamp,
        browser: b.browser,
        title: b.title
      }]->(b)
    `);

    // 10. Create co-location relationships (people at same place, same time)
    console.log("👥 Creating co-location relationships...");
    await session.run(`
      MATCH (p1:Person)-[r1:WAS_AT]->(loc:Place)<-[r2:WAS_AT]-(p2:Person)
      WHERE p1.name < p2.name AND 
            abs(duration.between(datetime(r1.timestamp), datetime(r2.timestamp)).minutes) < 60
      MERGE (p1)-[:CO_LOCATED_WITH {
        location: loc.coordinates,
        time_difference_minutes: duration.between(datetime(r1.timestamp), datetime(r2.timestamp)).minutes
      }]->(p2)
    `);

    console.log("\n✅ REAL CONNECTIONS CREATED! Now run this query in Neo4j Browser:");
    console.log("MATCH (n)-[r]-(m) RETURN n, r, m LIMIT 50");

    console.log("\n🎯 OR TRY THESE SPECIFIC QUERIES:");
    console.log(
      "1. See message network: MATCH (p:Person)-[r:SENT_MESSAGE]->(p2:Person) RETURN p, r, p2"
    );
    console.log(
      "2. See money flow: MATCH (w1:Wallet)-[r:TRANSFERRED]->(w2:Wallet) RETURN w1, r, w2"
    );
    console.log("3. See phone calls: MATCH (ph1:Phone)-[r:CALLED]->(ph2:Phone) RETURN ph1, r, ph2");
    console.log("4. See complete network: MATCH (n)-[r]-(m) RETURN n, r, m LIMIT 100");
  } catch (error) {
    console.error("Error creating connections:", error);
  } finally {
    await session.close();
    await driver.close();
  }
}

createRealConnections();
