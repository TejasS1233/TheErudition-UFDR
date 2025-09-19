import neo4j from "neo4j-driver";

const NEO4J_URI = "neo4j+s://e87bbc36.databases.neo4j.io";
const NEO4J_USER = "e87bbc36";
const NEO4J_PASSWORD = "NZeOfvfyfO4ZR16wy4k-jBNyfVBzBksAeuYphXDei7Q";

const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));

async function createSimpleConnections() {
  const session = driver.session();

  try {
    console.log("🔗 CREATING SIMPLE VISIBLE CONNECTIONS...");

    console.log("🧹 Clearing existing data...");
    await session.run("MATCH (n) DETACH DELETE n");

    console.log("👥 Creating people and their connections...");
    await session.run(`
      CREATE (john:Person {name: "John Smith", phone: "+1-555-1001"})
      CREATE (mike:Person {name: "Mike Johnson", phone: "+1-555-2001"})
      CREATE (sarah:Person {name: "Sarah Wilson", phone: "+1-555-3001"})
      CREATE (boss:Person {name: "Unknown Boss", phone: "+1-555-9999"})
      
      CREATE (john)-[:MESSAGED {content: "Transfer 5 BTC to wallet", platform: "WhatsApp", time: "15:00"}]->(mike)
      CREATE (mike)-[:MESSAGED {content: "BTC sent from my wallet", platform: "Telegram", time: "15:30"}]->(john)
      CREATE (john)-[:MESSAGED {content: "Pick up package from Mike", platform: "Signal", time: "16:00"}]->(sarah)
      CREATE (sarah)-[:MESSAGED {content: "Package secured", platform: "WhatsApp", time: "16:30"}]->(john)
      CREATE (boss)-[:MESSAGED {content: "Police surveillance detected", platform: "SMS", time: "17:00"}]->(john)
      CREATE (john)-[:MESSAGED {content: "Emergency! Delete everything", platform: "Telegram", time: "17:15"}]->(mike)
      CREATE (sarah)-[:MESSAGED {content: "John is compromised", platform: "Signal", time: "17:45"}]->(mike)
      CREATE (mike)-[:MESSAGED {content: "Split the remaining BTC", platform: "WhatsApp", time: "18:00"}]->(sarah)
    `);

    console.log("💰 Creating crypto wallets and transfers...");
    await session.run(`
      CREATE (wallet1:Wallet {address: "bc1qxy2k...mike", owner: "Mike Johnson"})
      CREATE (wallet2:Wallet {address: "1A1zP1e...john", owner: "John Smith"})
      CREATE (wallet3:Wallet {address: "35hK24t...sarah", owner: "Sarah Wilson"})
      CREATE (wallet4:Wallet {address: "1BvBMSE...backup", owner: "Backup Wallet"})
      CREATE (mixer:Wallet {address: "tornado_mixer", owner: "Tornado Cash"})
      
      CREATE (wallet1)-[:TRANSFERRED {amount: "5.0 BTC", time: "15:25"}]->(wallet2)
      CREATE (wallet2)-[:TRANSFERRED {amount: "5.0 BTC", time: "16:25"}]->(mixer)
      CREATE (mixer)-[:TRANSFERRED {amount: "1.5 BTC", time: "18:05"}]->(wallet3)
      CREATE (mixer)-[:TRANSFERRED {amount: "1.5 BTC", time: "18:10"}]->(wallet4)
      CREATE (mixer)-[:TRANSFERRED {amount: "2.0 BTC", time: "18:15"}]->(wallet1)
    `);

    console.log("🔗 Connecting people to wallets...");
    await session.run(`
      MATCH (john:Person {name: "John Smith"}), (wallet2:Wallet {address: "1A1zP1e...john"})
      CREATE (john)-[:OWNS]->(wallet2)
    `);

    await session.run(`
      MATCH (mike:Person {name: "Mike Johnson"}), (wallet1:Wallet {address: "bc1qxy2k...mike"})
      CREATE (mike)-[:OWNS]->(wallet1)
    `);

    await session.run(`
      MATCH (sarah:Person {name: "Sarah Wilson"}), (wallet3:Wallet {address: "35hK24t...sarah"})
      CREATE (sarah)-[:OWNS]->(wallet3)
    `);

    console.log("📍 Creating locations and connections...");
    await session.run(`
      CREATE (loc1:Location {name: "Meeting Point", coordinates: "40.7128,-74.0060"})
      CREATE (loc2:Location {name: "Drop Zone", coordinates: "40.7589,-73.9851"})
      CREATE (loc3:Location {name: "Safe House", coordinates: "40.6782,-73.9442"})
    `);

    await session.run(`
      MATCH (john:Person {name: "John Smith"}), (loc1:Location {name: "Meeting Point"})
      CREATE (john)-[:WAS_AT {time: "15:00"}]->(loc1)
    `);

    await session.run(`
      MATCH (mike:Person {name: "Mike Johnson"}), (loc1:Location {name: "Meeting Point"})
      CREATE (mike)-[:WAS_AT {time: "15:30"}]->(loc1)
    `);

    await session.run(`
      MATCH (sarah:Person {name: "Sarah Wilson"}), (loc2:Location {name: "Drop Zone"})
      CREATE (sarah)-[:WAS_AT {time: "16:30"}]->(loc2)
    `);

    await session.run(`
      MATCH (sarah:Person {name: "Sarah Wilson"}), (loc3:Location {name: "Safe House"})
      CREATE (sarah)-[:WAS_AT {time: "17:45"}]->(loc3)
    `);

    // 5. Create phone calls
    console.log("📞 Creating phone call connections...");
    await session.run(`
      MATCH (john:Person {name: "John Smith"}), (mike:Person {name: "Mike Johnson"})
      CREATE (john)-[:CALLED {duration: "7 minutes", time: "15:35", deleted: false}]->(mike)
    `);

    await session.run(`
      MATCH (mike:Person {name: "Mike Johnson"}), (sarah:Person {name: "Sarah Wilson"})
      CREATE (mike)-[:CALLED {duration: "3 minutes", time: "16:05", deleted: false}]->(sarah)
    `);

    await session.run(`
      MATCH (john:Person {name: "John Smith"}), (sarah:Person {name: "Sarah Wilson"})
      CREATE (john)-[:CALLED {duration: "10 minutes", time: "16:35", deleted: false}]->(sarah)
    `);

    await session.run(`
      MATCH (boss:Person {name: "Unknown Boss"}), (john:Person {name: "John Smith"})
      CREATE (boss)-[:CALLED {duration: "45 seconds", time: "17:00", deleted: true}]->(john)
    `);

    // 6. Create evidence destruction connections
    console.log("🗑️ Creating evidence destruction links...");
    await session.run(`
      CREATE (evidence1:Evidence {type: "Wallet Backup", file: "wallet_backup_1A1zP1e.dat", status: "DELETED"})
      CREATE (evidence2:Evidence {type: "Contact List", file: "contact_list_phones.txt", status: "RECOVERED"})
      CREATE (evidence3:Evidence {type: "Location File", file: "location_coordinates.txt", status: "RECOVERED"})
    `);

    await session.run(`
      MATCH (john:Person {name: "John Smith"}), (evidence1:Evidence {type: "Wallet Backup"})
      CREATE (john)-[:DESTROYED {time: "17:10", method: "secure_wipe"}]->(evidence1)
    `);

    await session.run(`
      MATCH (john:Person {name: "John Smith"}), (evidence2:Evidence {type: "Contact List"})
      CREATE (john)-[:DESTROYED {time: "17:12", method: "standard_delete"}]->(evidence2)
    `);

    console.log("\n✅ SIMPLE CONNECTIONS CREATED!");
    console.log("\n🎯 NOW RUN THESE QUERIES IN NEO4J BROWSER TO SEE THE CONNECTIONS:");
    console.log("\n1. See the complete network:");
    console.log("   MATCH (n)-[r]-(m) RETURN n, r, m");

    console.log("\n2. See just the people and their messages:");
    console.log("   MATCH (p1:Person)-[r:MESSAGED]->(p2:Person) RETURN p1, r, p2");

    console.log("\n3. See the money flow:");
    console.log("   MATCH (w1:Wallet)-[r:TRANSFERRED]->(w2:Wallet) RETURN w1, r, w2");

    console.log("\n4. See who was where:");
    console.log("   MATCH (p:Person)-[r:WAS_AT]->(l:Location) RETURN p, r, l");

    console.log("\n5. See the complete criminal network:");
    console.log("   MATCH (n) RETURN n");

    console.log("\n🔥 YOU SHOULD NOW SEE LINES CONNECTING THE DOTS!");
  } catch (error) {
    console.error("Error creating connections:", error);
  } finally {
    await session.close();
    await driver.close();
  }
}

createSimpleConnections();
