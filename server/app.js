const express = require("express");
// const dbHandler = require("./dbHandler.js");
//const { connectTODb, getDb, connectToDb } = require('./db')
const fs = require('fs');
const { stringify, parse } = require('wkt');
const {getToken, getGeo, answeredQuestions,  getAllAdminQuestions, addQuestion, isNeighborCountry, startGame, login, getTerritories, getAllUsers, register, addTeamToLosers, addQuestionToGame, endGame, addWrongAnswerToTeam, getAllGroups, getQuestion, addCountryToTeam, addUserToTeam, createTeam, createGame, createCollections,checkCountriesLost, deleteGame } = require("./db.js")
const {athenticateToken} = require("./authentication.js")
const {insertNeighborCountries} = require("./neighbor_countries")
const { geojsonSchema, NeighborCountrySchema, UserSchema, TeamSchema, GameSchema, questionSchema, refreshTokenSchema } = require("./models");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();





const port = 3001;

const sqlite3 = require('sqlite3').verbose();
let sql;


// connectToDb((err) => {
//     if(!err) {
//         app.listen(port, ()=>{console.log('app lis')})
//         db = getDb
//     }
// })

const app = express();
const http = require("http").Server(app);
const cors = require("cors");
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(athenticateToken);
http.listen(port, () => {
    console.log(`Server listening on ${port}`);
});
const socketIO = require('socket.io')(http, {
    cors: {
        origin: "<http://localhost:3001>"
    }
});

const stopGame = async (gameName)=>{
    const Game = mongoose.model('Game', GameSchema);
    const game = await Game.findOne({ gameName: gameName});
}
socketIO.on('connection', (socket) => {
    console.log(` ${socket.id} user just connected!`);

    socket.on("createGame", async (gameInfo, cb) => {
        socket.join(gameInfo.gameName);
        await createGame(gameInfo)
        games = await getAllGroups(gameInfo.teacher)
       //console.log("hii everyone socket gameList", games)
        socket.to("joinedGame").emit("gamesList", games);
        cb(games);
    });
    socket.on("joinToGame", async (userInfo)=>{
        socket.join("joinedGame");
    })
    socket.on("startGame",  async (gameInfo) => {
        let addedCountryToTeam = await addCountryToTeam(gameInfo)
        
    });
    // socket.on("getQuestion", (username, originCountry, gameName) => {
    //     socket.join(username);
    //     let question = getQuestion({ username, originCountry, gameName });
    //     socket.to(username).emit("returnQuestion", question);
    // });
    socket.on("deleteGame", async (gameInfo)=>{
        endGame(gameInfo.gameName);
    })
    socket.on("stopGame", async (gameInfo) =>{
        const Game = mongoose.model('Game', GameSchema);
        const game = await Game.findOne({ gameName: gameInfo.gameName});
        if (game) {
            
            const maxPoints = Math.max(...game.teams.map(team => team.points));
        
            
            const teamsWithMaxPoints = game.teams.filter(team => team.points === maxPoints);
            const teamsWithMaxPointsNames = teamsWithMaxPoints.map(team => team.name);
        
           
            const allTeamNames = game.teams.map(team => team.name);
            const restOfTheTeamsNames = allTeamNames.filter(name => !teamsWithMaxPointsNames.includes(name));
            socket.to(gameInfo.gameName).emit("stopedGame",{lostTeams: restOfTheTeamsNames, winners: teamsWithMaxPointsNames});
            console.log("Teams with maximum points:", teamsWithMaxPointsNames);
            console.log("Rest of the teams:", restOfTheTeamsNames);
          } else {
            console.log("Game not found");
          }
    })
    socket.on("addCountryToTeam", async (teamAddCountryInfo, cb) => {
        //socket.join(teamAddCountryInfo.gameName );
        //socket.to(gameName + "_" + originCountry).emit("returnQuestion", question);
        let addedCountryToTeam = await addCountryToTeam(teamAddCountryInfo)
       // console.log("in addCountry 68-", addedCountryToTeam)
        let losts= await checkCountriesLost(teamAddCountryInfo.gameName);
        if(addedCountryToTeam){
            //console.log("before socket sends to addedCountry-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------")
            socket.to(teamAddCountryInfo.gameName).emit("addedCountryToTeam",{color:addedCountryToTeam["color"], team: teamAddCountryInfo.teamName, country: teamAddCountryInfo.occupiedCountry, countryPoints: addedCountryToTeam["points"]});
            if(losts.length !=0 && losts["losts"].length!=0){
                for(let i=0; i<losts["losts"].length; i++){
                    addTeamToLosers(teamAddCountryInfo.gameName, losts["losts"][i])
                }

                socket.to(teamAddCountryInfo.gameName).emit("lostCountries",{lostTeams: losts["losts"], winners: losts["wins"]});

                cb({color:addedCountryToTeam["color"], team: teamAddCountryInfo.teamName, country: teamAddCountryInfo.occupiedCountry, countryPoints: addedCountryToTeam["points"]}, {lostTeams: losts["losts"], winners: losts["wins"]})
                if(losts["wins"].length==1){
                    socket.to(teamAddCountryInfo.gameName).emit("winner",losts["wins"][0]);
                }
            }
            // very important to check if the else is needed
            else{
                cb({color:addedCountryToTeam["color"], team: teamAddCountryInfo.teamName, country: teamAddCountryInfo.occupiedCountry, countryPoints: addedCountryToTeam["points"]}, {lostTeams: [], winners: []})
            }
        }
        else {
            socketIO.to(teamAddCountryInfo.gameName).emit('hello', msg);
        }
    });
    socket.on("addWrongAnswerToTeam", async (teamAddWrongAnswer, cb) => {
      //  console.log("hii in addWrongAnswerToTeam")
        let numOfErrors = await addWrongAnswerToTeam(teamAddWrongAnswer)
      //  console.log("number of errors", numOfErrors)
        if(numOfErrors["numOfErrors"]>3){
            console.log("nummmOfErrorrrsTeammaa",numOfErrors["numOfErrors"])
            addTeamToLosers(teamAddWrongAnswer.gameName, teamAddWrongAnswer.teamName)
            socket.to(teamAddWrongAnswer.gameName).emit("lostCountries",{lostTeams: [teamAddWrongAnswer.teamName], winners: numOfErrors["restOfTeams"]});
            if(numOfErrors["restOfTeams"].length==1){
                socket.to(teamAddWrongAnswer.gameName).emit("winner",numOfErrors["restOfTeams"][0]);
            }
            
        }
        cb(numOfErrors["numOfErrors"])
    });
    socket.on("sendToWinner", (winner) =>{
        socket.to(winner.gameName).emit("winner",winner["winner"]);
    })
    socket.on("createTeam", (teamInfo) => {
        socket.join(teamInfo.gameName);
        createTeam(teamInfo)

    });
    socket.on("joinUserToGame", (userGameInfo)=>{
        enterGame(userGameInfo.gameName, userGameInfo.teamName, userGameInfo.username)
        socket.join(userGameInfo.gameName)
    });
    socket.on('disconnect', () => {
        socket.disconnect()
        console.log(' A user disconnected');
    });
});

app.use(express.json())


app.use(express.json());

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://uri:dan@cluster0.lku9ksw.mongodb.net/?retryWrites=true&w=majority');

const db = mongoose.connection;

//db.createCollection('users');
//db.createCollection('friends');
//db.createCollection('neighbor_countries');
//db.createCollection('Teams');
//db.createCollection('team_users');
//db.createCollection('games');
//db.createCollection('questions');
//db.createCollection('usedQuestions');

app.post("/games", async (req, res) => {
    try{
        games = await getAllGroups(req.body)
        res.send(games);
    }catch(err) {
        res.sendStatus(400)
    }
});

app.post("/deleteGame", async (req, res) => {
    try{
        await deleteGame(req.body.gameName);
        res.sendStatus(200);
    }catch(err) {
        res.sendStatus(400)
    }
});



app.post('/addQuestionToGame', async (req, res) => {
    let status = await addQuestionToGame(req.body);
    if(status.message == 'good' ){
        res.sendStatus(200)
    }
    if(status.message == 'Question not found' ){
        res.sendStatus(400);
    }
    if(status.message == 'somthing went wrong'){
        res.sendStatus(500);
    }
         
})

app.post('/register', async (req, res) => {
    let status = await register(req.body);
    if(status.message == 'Ok' ){
        res.sendStatus(200)
    }
    if(status.message == 'Username already exists' ){
        return res.status(409).json({ error: 'Username already exists' });
    }
    if(status.message == 'Something went wrong'){
        res.sendStatus(500);
    }
})


app.post('/insert_neighbors', async (req, res) => {
    try {
        await insertNeighborCountries()
        res.sendStatus(200);
    }catch (error){
        res.sendStatus(500);
    }
})


app.post('/submitTeams', async (req, res) => {

    for(i=0;i<req.body["teamsMembers"].length;i++){
        await createTeam(req.body["teamsMembers"][i], req.body.timeLimit);
    }
    res.sendStatus(200)

})


app.post('/getAllUsers', async (req, res) => {
    console.log("hi in getAllUsers")
    let users = await getAllUsers(req.body.school, req.body.grade);
    if(users?.message=="Something went wrong"){
        res.sendStatus(500)
    }
    else{
        console.log("usersss", users)
        res.json(users);}
});

app.post("/getTerritories", async (req, res) => {
    let teamsTerritories = await getTerritories(req.body.gameName)
    if(teamsTerritories?.message=="Something went wrong"){
        res.sendStatus(500)
    }
    else{
        res.send({teamsTerritories: teamsTerritories});
    }
})


app.post('/getGeo', async (req, res) => {
    let getGeoRes = await getGeo(req);
    if(getGeoRes?.message=='Something went wrong'){
        res.sendStatus(500);
    }
    else if(getGeoRes?.geoJSONObject){
        res.json(getGeoRes.geoJSONObject);
    }
    else{
        res.sendStatus(400);
    }
})
    

app.post('/token', async (req, res) => {

    let tokenRes= await getToken(req);

    if(tokenRes?.message=='Something went wrong'){
        return res.sendStatus(401)
    }
    if(tokenRes?.message=='Token has expired, sign in again'){
        return res.status(403).json("Token has been expired, sign in again")
    }
    else if(tokenRes?.accessToken){
        res.json({ accessToken: tokenRes.accessToken })
    }
    else{
        res.sendStatus(400);
    }

  })
 

app.post('/login', async (req, res) => {
    let loginRes = await login(req.body)
    if(loginRes?.message=='invalid password'){
        res.status(400).send('invalid password');
    }
    else if(loginRes?.message=='Something went wrong'){
        res.sendStatus(500);
    }
    else if(loginRes?.message=='user not refistered'){
        res.status(400).send('user not refistered');
    }
    else{
        res.json(loginRes)
    }
})


function generateAccessToken(user){
    console.log("in generateeeeeee AccessToken")
    return jwt.sign({ user: user.username, role: user.role }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '12s'})

}

const enterGame = async (gameName, teamName, username)=>{
    const Game = mongoose.model('Game', GameSchema);
    await Game.updateOne(
        { gameName: gameName, 'teams.name': teamName },
        { $addToSet: { 'teams.$.teamMembersEntered': username } }
      );
}

  const canStartGame = async (gameName) => {
    const Game = mongoose.model('Game', GameSchema);
    const game = await Game.findOne({ gameName: gameName});
    return game.started
  }

app.post('/startGame', async (req, res) => {
    let startGameRes = await startGame(req.body)
    if(startGameRes?.message =='Game not found' ){
        return res.status(404).json({ message: 'Game not found' });
    }
    else if(startGameRes?.message =='Internal Server Error'  ){
        return res.status(500).json({ message: 'Internal Server Error' });
    }
    else if(startGameRes?.message =='Ok'  ){
        return res.sendStatus(200);
    }
})

app.post('/isNeighborCountry', async (req, res) => {
    let isNeighborCountryRes = await isNeighborCountry(req.body)
    if(isNeighborCountryRes?.message =='wait for the teacher to start game' ){
        res.json({
            message: 'wait for the teacher to start game'
        });
    }
    else if(isNeighborCountryRes?.message =='Something went wrong' ){
        res.sendStatus(400);
    }
    else if(isNeighborCountryRes?.message =='no questions left' ){
        res.json({
            message: 'no questions left'
        });
    }
    else if(isNeighborCountryRes?.message =='no' ){
        res.json({
            message: 'no'
        });
    }
    else if(isNeighborCountryRes?.message =='ok' ){
        res.json(isNeighborCountryRes);
    }
})


app.post('/addAllQuestionsToGame', async (req, res) => {
    req.body.ids.forEach(id => {
        const newData = {
          ...req.body,
          id:id, 
        };
        delete newData.ids;
      
        addQuestionToGame(newData);
      });
      res.sendStatus(200)
})

app.post('/addQuestion', async (req, res) => {
    let addQuestionRes = await addQuestion(req.body)
    if(addQuestionRes?.message === 'Internal Server Error' ){
       res.sendStatus(500);
    }
    if(addQuestionRes?._id){
        res.status(200).send({ _id: addQuestionRes._id });
    }
    else{
        res.sendStatus(400)
    }

})

app.post('/getAllAdminQuestions', async (req, res) => {
    let getAdminQustionsRes = await getAllAdminQuestions(req)
    if(getAdminQustionsRes?.message === 'Internal Server Error' ){
        res.sendStatus(500);
     }
     if(getAdminQustionsRes?.questions){
        res.json({"questions": getAdminQustionsRes.questions})
     }
     else{
        res.sendStatus(400);
     }
})

app.post('/getAnsweredQuestions', async (req, res) => {
    let answeredQuestionRes = await answeredQuestions(req)
    if(answeredQuestionRes?.message === 'Internal Server Error' ){
        res.sendStatus(500);
     }
     if(answeredQuestionRes?.questions){
        res.json({"questions": answeredQuestionRes.questions})
     }
     
})


