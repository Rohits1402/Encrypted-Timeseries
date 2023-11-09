const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const crypto = require("crypto");
const mongoose = require("mongoose");
const cors = require("cors");
const TimeSeriesData = require("./app/models/timeseries-model");
const configureDB = require("./config/db");

const app = express();
app.use(cors());

const server = http.createServer(app);
// Configure Socket.IO with allowed origins
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

// Function to decrypt a message
function decryptMessage(encryptedMessage, iv, passKey) {
  try {
    const hexData = encryptedMessage;
    const decipher = crypto.createDecipheriv(
      "aes-256-ctr",
      Buffer.from(passKey, "hex"),
      Buffer.from(iv, "hex")
    );
    let decryptedMessage = decipher.update(hexData, "hex", "utf8");
    decryptedMessage += decipher.final("utf8");

    try {
      const parsedMessage = JSON.parse(decryptedMessage);
      return parsedMessage;
    } catch (error) {
      console.error("Error parsing decrypted message:", error);
      return null;
    }
  } catch (error) {
    console.error("Error decrypting message:", error);
    return null;
  }
}

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("dataFromEmitter", async (message) => {
    console.log("Received data from emitter:", message);

    const decryptedMessage = decryptMessage(
      message.encryptedMessage,
      message.iv,
      message.passKey
    );
    console.log("Decrypted Message before:", decryptedMessage);

    if (decryptedMessage) {
      console.log("Message is valid.");

      // Save the message to the database
      await saveDecryptedMessageToDatabase(decryptedMessage);
    }
  });
});

async function saveDecryptedMessageToDatabase(decryptedMessage) {
  try {
    // Get the current time
    const currentTime = new Date();

    // Format the timestamp as desired (e.g., "YYYY-MM-DD HH:MM AM/PM")
    const formattedTimestamp = currentTime.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // Find a document for the current minute
    // let timeSeriesDocument = await TimeSeriesData.findOne({
    //   timestamp: {
    //     $gte: new Date().setMinutes(currentTime.getMinutes(), 0, 0),
    //     $lt: new Date().setMinutes(currentTime.getMinutes(), 59, 59),
    //   },
    // })

    // Find a document for the current minute
    let timeSeriesDocument = await TimeSeriesData.findOne({
      timestamp: formattedTimestamp,
    });

    if (!timeSeriesDocument) {
      // If the document for the current minute doesn't exist, create it
      timeSeriesDocument = new TimeSeriesData({
        timestamp: formattedTimestamp,
        data: [],
      });
    }

    // Add the decrypted message to the data array
    timeSeriesDocument.data.push({
      name: decryptedMessage.name,
      origin: decryptedMessage.origin,
      destination: decryptedMessage.destination,
      timestamp: formattedTimestamp,
    });

    console.log(timeSeriesDocument);
    // Save the updated document
    await timeSeriesDocument.save();
    console.log(
      "Message saved to the time-series database for minute:",
      formattedTimestamp
    );
    // Emit the saved data back to the frontend
    io.emit("dataSaved", {
      timestamp: formattedTimestamp,
      data: timeSeriesDocument.data,
    });
    console.log("times", timeSeriesDocument.data);
  } catch (error) {
    console.error("Error saving message to the time-series MongoDB:", error);
  }
}

const port = process.env.PORT || 4444;

server.listen(port, () => {
  console.log("Listener service is running on port", port);
  configureDB(); // Connect to the database
});
