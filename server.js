require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();

const port = process.env.PORT || 3000;

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('db connected');
})

app.use(cors({ optionsSuccessStatus: 200 }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/public", express.static(__dirname + "/public"));

const userSchema = new mongoose.Schema({
    username: String
});



const User = mongoose.model("User", userSchema);

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html");
})

app.get("/api/exercise/users",(req,res)=>{
    User.find({},(err,foundUsers)=>{
        if (err) {
            return console.log(err);
        }
        res.json(foundUsers);
    })
})

app.post("/api/exercise/new-user", (req, res) => {
    var name = req.body.username;
    User.find({ username: name }, (error, foundUser) => {
        if (error) {
            console.log(error);
        } else {
            if (foundUser.length == 0) {
                const newUser = new User({ username: name });
                newUser.save((error, success) => {
                    if (error) {
                        return console.log(error);
                    } else {
                        res.json({ "username": success.username, "_id": success._id });
                    }
                });
            }else{
                res.send("Username already taken");

            }
        }
    });
})

app.listen(port, () => {
    console.log("App is running on port: " + port);
})