const mongoose = require("mongoose");

const configureDB = async () => {
  try {
    const db = await mongoose.connect(
      "mongodb+srv://rschauhan1402:rohit2001@cluster0.e8cccei.mongodb.net/"
    );
    console.log("connecting to db");
  } catch (e) {
    console.log("error connecting to db");
  }
};
module.exports = configureDB;
