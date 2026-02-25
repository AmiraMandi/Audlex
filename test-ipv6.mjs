import net from "node:net";
const socket = new net.Socket();
socket.setTimeout(10000);
socket.connect({ host: "2a05:d018:135e:16ad:c056:d408:6b92:b54d", port: 5432, family: 6 }, () => {
  console.log("TCP OK IPv6");
  socket.destroy();
  process.exit(0);
});
socket.on("error", (e) => {
  console.log("TCP FAIL:", e.message);
  socket.destroy();
  process.exit(1);
});
socket.on("timeout", () => {
  console.log("TCP TIMEOUT");
  socket.destroy();
  process.exit(1);
});
