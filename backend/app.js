import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/auth.routes.js"

//load env var & DB Connection
dotenv.config();
connectDB();

const app = express();  //create express app

//middleware
app.use(cors());
app.use(express.json());

//App routes,
app.use("/api/auth", authRoutes);

//test route
app.get("/", (req, res) => {
    res.send("Finserve Lite API running");
});

//export app
export default app;