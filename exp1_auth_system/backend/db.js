const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    let uri = process.env.URI;
    uri = uri.replace("<password>", process.env.DB_PASSWORD);
    mongoose.connect(uri);
    console.log("Database connected !");
  } catch (error) {
    console.log("Error while connecting to db. !!!", error.message);
  }
};

module.exports = connectDB;
