import neo4j from "neo4j-driver";

const NEO4J_URI = "neo4j+s://e87bbc36.databases.neo4j.io";
const NEO4J_USER = "e87bbc36";
const NEO4J_PASSWORD = "NZeOfvfyfO4ZR16wy4k-jBNyfVBzBksAeuYphXDei7Q";

async function clearNeo4j() {
  const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));
  const session = driver.session();

  try {
    console.log("Connected to Neo4j");

    const result = await session.run("MATCH (n) DETACH DELETE n");
    console.log("Deleted all nodes and relationships from Neo4j");
    console.log(`Summary: ${result.summary.counters.updates()}`);

    await session.close();
    await driver.close();
    console.log("Disconnected from Neo4j");
  } catch (err) {
    console.error("Error clearing Neo4j:", err);
    await session.close();
    await driver.close();
  }
}

clearNeo4j();
