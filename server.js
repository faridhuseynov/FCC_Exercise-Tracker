require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose= require("mongoose");
const bodyParser = require("body-parser");

const app = express();

app.use(cors({optionsSuccessStatus:200}));
app.use(bodyParser.urlencoded({extended:true}));
app.use("/public",express.static(__dirname + "/public"));

app.get("/",(req,res)=>{
    res.sendFile(__dirname+"/views/index.html");
})

app.listen(process.env.PORT,()=>{
    console.log("App is running on port: "+port);
})