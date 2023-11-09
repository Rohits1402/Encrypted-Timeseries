const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const timeSeriesSchema = new Schema({
  timestamp: {
    type: String,
    required: true,
  },
  data: [
    {
      name: String,
      origin: String,
      destination: String,
    },
  ],
});

const TimeSeriesData = mongoose.model("TimeSeriesData", timeSeriesSchema);

module.exports = TimeSeriesData;
