const express = require("express");
const ConnectToDatabase = require("./Configurations/Connection");
const ErrorHandling = require("./Middlewares/ErrorHandling");
const SeedingRoles = require("./Data/SeedRoles");
const cors = require("cors");

const UserRoutes = require("./API/Routes/UserRoutes");
const NBARoutes= require("./API/Routes/NBARoutes");
const NewsRoutes = require("./API/Routes/NewsRoutes")
const PORT =5000;
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/Users",UserRoutes);
app.use("/api/NBA",NBARoutes);
app.use("/api/News",NewsRoutes);
app.get("/nesto",(req,res)=>res.json("rutica"));
app.use("/",(req,res,next)=>res.json("Failed route"))

app.use(ErrorHandling);
ConnectToDatabase(app,PORT);
()=>SeedingRoles;

