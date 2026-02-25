import net from "node:net";

// First test raw TCP connectivity to IPv6 address
const socket = new net.Socket();
socket.setTimeout(10000);

socket.connect({ host: "2a05:d018:135e:16ad:c056:d408:6b92:b54d", port: 5432, family: 6 }, () => {
  console.log("TCP connection OK to IPv6!");
  socket.destroy();
  process.exit(0);
});

socket.on("error", (e) => {
  console.log("TCP connection FAILED:", e.message);
  socket.destroy();
  process.exit(1);
});

socket.on("timeout", () => {
  console.log("TCP connection TIMEOUT");
  socket.destroy();
  process.exit(1);
});

try {
  const result = await sql`SELECT 1 as test`;
  console.log("CONNECTION OK:", result);
} catch (e) {
  console.log("CONNECTION ERROR:", e.message);
} finally {
  process.exit(0);
}
