const express = require("express");
const cors = require("cors");
const mongoose= require("mongoose");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT||3000;

app.use(cors({optionsSuccessStatus:200}));
app.use(bodyParser.urlencoded({extended:true}));
app.use("/public",express.static(__dirname + "/public"));

app.get("/",(req,res)=>{
    res.sendFile(__dirname+"/views/index.html");
})

app.listen(port,()=>{
    console.log("App is running on port: "+port);
})