const express = require("express");
const cors = require("cors");
const TimeSeriesData = require("./app/models/timeseries-model");
const configureDB = require("./config/db");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
configureDB();

// route to fetch data from the database
app.get("/api/data", async (req, res) => {
  try {
    // Fetch data from the TimeSeriesData collection
    const data = await TimeSeriesData.find({});
    console.log("data", data);
    res.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
