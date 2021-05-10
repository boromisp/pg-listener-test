const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  query_timeout: 1000, // Ping query timeout
});

const HEARTBEAT_TIMEOUT = 25000;

async function ping(client) {
  try {
    await client.query(";");
  } catch (error) {
    console.error("Ping error", error);

    try {
      await client.end();
    } catch (error) {
      console.log("Disconnect error", err);
    }
  }
}

async function main() {
  await client.connect();

  let pingTimeout = setTimeout(() => ping(client), HEARTBEAT_TIMEOUT);

  client.on("notification", (n) => {
    console.log(`[${n.processId}] ${n.channel}: ${n.payload || ""}`);

    clearTimeout(pingTimeout);
    pingTimeout = setTimeout(() => ping(client), HEARTBEAT_TIMEOUT);
  });

  client.once("end", () => clearTimeout(pingTimeout));

  await client.query("LISTEN foo");
}

main();
