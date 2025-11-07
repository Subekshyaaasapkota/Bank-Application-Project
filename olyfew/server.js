const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoute");
const cors = require("cors");
const url= process.env.URL ||''

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/user", userRoutes);
const PORT=5000

mongoose
  .connect(
    url
  )
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server on port ${PORT} running`));
  })
  .catch((err) => console.error("DB error:", err));
