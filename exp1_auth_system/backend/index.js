const { server } = require("./socket.js");
const connectDB = require("./db.js");

require("dotenv").config();

const port = process.env.PORT || 8000;

await connectDB();

server.listen(port, () => {
  console.log(`Server started at PORT : ${port}`);
});
