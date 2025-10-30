const mongoose = require("mongoose");

async function connectDB() {
  try {
    console.log("MONGO_URI from env:", process.env.MANGODB_URL);

    if (!process.env.MANGODB_URL) {
      console.log("ENV not available for DB");
      return;
    }

    const conn = await mongoose.connect(process.env.MaNGODB_URL);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = connectDB;
