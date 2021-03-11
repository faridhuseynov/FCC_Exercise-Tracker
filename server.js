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
    username: String,
});

const exerciseSchema = new mongoose.Schema({
    userId:String,
    description:String,
    duration:Number,
    date:Date,
});

const User = mongoose.model("User", userSchema);
const Exercise = mongoose.model("Exercise",exerciseSchema);

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html");
})

app.get("/api/exercise/users",(req,res)=>{
    User.find({},(err,foundUsers)=>{
        if (err) {
            return res.send(err);
        }
        res.json(foundUsers);
    })
})

app.get("/api/exercise/log", (req, res) => {
    var userId = req.query.userId;
    var from = req.query.from==undefined?undefined:(new Date(req.query.from));
    var to = req.query.to==undefined?undefined:(new Date(req.query.to));
    var limit = req.query.limit;
    console.log(req.query);
    if(userId==undefined)
        return res.send('Unknown userId');
    User.find({"_id":userId},(err,foundUser)=>{
        if(err){
            return res.send(`Cast to ObjectId failed for value "${userId}" at path "_id" for model "Users"`);
        }
        var user = {"_id":foundUser[0]._id, "username":foundUser[0].username};
        Exercise.find({"userId":user._id},{_id:0,__v:0, userId:0},(err,exercises)=>{
            var logs = exercises;
            if(logs.length>0){
                if(from!=undefined && from!='Invalid Date'){
                    logs = logs.filter(exercise=>{
                        var date = (new Date(exercise.date));
                        if(date.getTime()>=from.getTime()){
                            return date;
                        }
                    })
                }
                if(to!=undefined && to!='Invalid Date'){
                    logs = logs.filter(exercise=>{
                        var date = new Date(exercise.date);
                        if(date.getTime()<=to.getTime()){
                            return date;
                        }
                    })
                }
                logs.forEach(exercise=>exercise.date.toDateString());
                if(logs.length>limit && limit>=0){
                    logs = logs.slice(0,limit);
                }
            }
            user.count=logs.length;
            user.log=logs;
            res.send(user);
        });
    })
})

app.post("/api/exercise/new-user", (req, res) => {
    var name = req.body.username;
    User.find({ username: name }, (error, foundUser) => {
        if (error) {
            return res.send(error);
        } else {
            if (foundUser.length == 0) {
                const newUser = new User({ username: name });
                newUser.save((error, success) => {
                    if (error) {
                        return res.send(error);
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

app.post("/api/exercise/add",(req,res)=>{
    var exercise = req.body;
    // if no date specified, then today is the date
    exercise.date = exercise.date==""?((new Date()).toDateString()):((new Date(exercise.date)).toDateString());
    const newExercise = new Exercise({
        userId:exercise.id,
        description:exercise.description,
        duration:exercise.duration,
        date:exercise.date
    })
    User.find({_id:exercise.id},(err,foundUser)=>{
        if(err){
            return res.send(err);
        }
        newExercise.save((err,savedExercise)=>{
            if(err){
                if (err.kind=="ObjectId") {
                    return res.send("User Id is wrong, please check and try again");
                }
                return res.send(err);
            }
            res.json({
                _id: foundUser[0]._id, username: foundUser[0].username, date: savedExercise.date.toDateString(),
                duration: savedExercise.duration, description: savedExercise.description
            });
        });
    })
})

app.listen(port, () => {
    console.log("App is running on port: " + port);
})