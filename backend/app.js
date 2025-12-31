import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";

//DB Connection
dotenv.config();
connectDB();

const app = express();  //create express app

//middleware
app.use(cors());
app.use(express.json());

//test route
app.get("/", (req, res) => {
    res.send("Finserve Lite API running");
});

//export app
export default app;