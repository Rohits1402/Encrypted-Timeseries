const crypto = require("crypto");
const socket = require("socket.io-client")("http://localhost:4444");

const data = require("./data.json");

// Function to generate an encrypted message
function generateMessage(data) {
  const { names, cities } = data;

  const randomName = names[Math.floor(Math.random() * names.length)];
  const randomOrigin = cities[Math.floor(Math.random() * cities.length)];
  const randomDestination = cities[Math.floor(Math.random() * cities.length)];

  const originalMessage = {
    name: randomName,
    origin: randomOrigin,
    destination: randomDestination,
  };

  // Convert the message to a JSON string
  const messageString = JSON.stringify(originalMessage);

  // Create the secret_key by hashing the original message
  const secret_key = crypto
    .createHash("sha256")
    .update(messageString)
    .digest("hex");

  // Generate a valid 256-bit key for AES-256-CTR
  const passKey = crypto.randomBytes(32).toString("hex");

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-ctr",
    Buffer.from(passKey, "hex"),
    iv
  );

  let encryptedMessage = cipher.update(messageString, "utf8", "hex");
  encryptedMessage += cipher.final("hex");

  // Store the message data in a variable
  const messageData = {
    name: randomName,
    origin: randomOrigin,
    destination: randomDestination,
    secret_key: secret_key,
    encryptedMessage: encryptedMessage,
    iv: iv.toString("hex"), // Send the IV as part of the message
    passKey: passKey,
  };

  return messageData;
}

// Send a new message stream every 10 seconds
setInterval(() => {
  const message = generateMessage(data);

  // Convert the message to a string, including the IV and passKey
  const dataStream = `${message.name},${message.origin},${message.destination},${message.secret_key},${message.encryptedMessage},${message.iv},${message.passKey}`;
  socket.emit("dataFromEmitter", {
    encryptedMessage: message.encryptedMessage,
    iv: message.iv,
    passKey: message.passKey,
  });
  console.log("Emitting message to the listener:", dataStream);
}, 10000);
