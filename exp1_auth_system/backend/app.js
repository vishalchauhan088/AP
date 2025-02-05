const express = require("express");
const userRouter = require("../backend/src/routes/userRoute");

const path = require("path");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.status(200).json({
    message: "hello world",
  });
});

app.use("/v1/api/user", userRouter);

app.use("*", (req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// global error handler
app.use((error, req, res, next) => {
  res.status(500).json({
    status: "fail",
    message: error.message,
  });
});

module.exports = app;
