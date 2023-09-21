const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database connected succesfully");
  } catch (error) {
    console.error("Failed to connect to the database", error);
    process.exit(1);
  }
}

module.exports = connectDB;
