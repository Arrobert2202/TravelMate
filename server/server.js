const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const connectDB = require("./db");
const cors = require("cors");
require("dotenv").config();
const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

app.listen(process.env.PORT, () =>{
  console.log('Server is listening on port ${process.env.PORT}');
});