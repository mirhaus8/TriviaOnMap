const express = require("express");
// const dbHandler = require("./dbHandler.js");
//const { connectTODb, getDb, connectToDb } = require('./db')
const fs = require('fs');
const { stringify, parse } = require('wkt');
const { addTeamToLosers, addQuestionToGame, endGame, addWrongAnswerToTeam, getAllGroups, getQuestion, addCountryToTeam, addUserToTeam, createTeam, createGame, createCollections,checkCountriesLost, deletGame } = require("./db.js")
const {athenticateToken} = require("./authentication.js")
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
         //   console.log("nummmOfErrorrrsTeammaa",)
            addTeamToLosers(teamAddWrongAnswer.gameName, teamAddWrongAnswer.teamName)
            socket.to(teamAddWrongAnswer.gameName).emit("lostCountries",{lostTeams: [teamAddWrongAnswer.teamName], winners: numOfErrors["restOfTeams"]});
            cb()
        }
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
   // console.log("booom getAllGroups",req.headers, req.get("Auth"), req.body)
    // if (req.body && req.body.role) {
    //     role = req.body.role
    //     games = await getAllGroups(req.body)
    //     console.log("hiii get all groups teacher", games)
    //     res.send(games);
    // }
    games = await getAllGroups(req.body)
   // console.log("hiii get all groups regular", games)
    res.send(games);
});

app.post("/deleteGame", async (req, res) => {
   // console.log("in /deleteGame", req.body.gameName)
    await deletGame(req.body.gameName);
    res.sendStatus(200);
});



app.post('/addQuestionToGame', async (req, res) => {
    const question = {
        _id: req.body.id,
        difficulty: req.body.difficulty,
        class: req.body.class,
    }
    
    const GameS = mongoose.models.Game || mongoose.model('Game', GameSchema);;
    const Question = mongoose.models.questions || mongoose.model('questions', questionSchema);
    try {
        const questionById = await Question.findById(req.body.id);
        if (!questionById) {
            return res.status(404).json({ error: 'Question not found' });
        }

    
        questionById.tags.push(...req.body.tags);
    
        // Save the updated question
        await questionById.save();
      //  console.log("hi from addQGame", req.body.gameName)
        const game = await GameS.findOne({ gameName: req.body.gameName });
      //  console.log("gammmmememememmememmeme", game.gameName)
        game.questions.push(question);
        await game.save();
        res.sendStatus(200);
      } catch (err) {
        res.sendStatus(400);
      }      
})

app.post('/register', async (req, res) => {
    try {
      //  console.log("in register   ", req.body)
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = {
            name: req.body.username,
            password: hashedPassword,
            role: req.body.role,
            school: req.body.school,
            grade: req.body.grade,
            friends: []
        };
        const User = mongoose.model('users', UserSchema);
        const existingUser = await User.findOne({ name: req.body.username });
     //   console.log("alreadyyyyy registered", existingUser)
        if (existingUser) {
            return res.status(409).json({ error: 'Username already exists' });
        }


        


        User.create(user, (err, result) => {
            if (err) {
          //      console.log('Error inserting game: ', err);
                res.sendStatus(400);
            }
            res.sendStatus(200);
        });
    } catch {
        res.sendStatus(500);
    }

    // db.collection('users').insertOne(user, (err, result) => {
    //     if (err) {
    //         console.log(err);
    //         res.sendStatus(400)
    //     } else {
    //         console.log(`Document inserted with _id: ${result.insertedId}`);
    //         res.sendStatus(200)
    //     }
    // });
})



app.post('/getOriginsCountries', async (req, res) => {
    const Game = mongoose.model('Game', GameSchema);
    let occupiedCntr = await Game.find({
        gameName: req.body.gameName,
    });
    let origins = occupiedCntr[0].teams.filter(element => element.originCountry)
    origins = occupiedCntr[0].teams.map(element=>element.originCountry ? {team:element.name, origin: element.originCountry} : '');
    res.send({originCountries: origins});
})


app.post('/neighbors', (req, res) => {
    if (mongoose.modelNames().includes('neighbor_countries')) {
     //   console.log('neighbor_countries exists!');
    }
    const NeighborCountry = mongoose.model('neighbor_countries', NeighborCountrySchema);
    NeighborCountry.deleteMany({}, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log(`${result.deletedCount} documents deleted`);
        }
    });
    let neighbors_countries =
    [{
        _id: new mongoose.Types.ObjectId(), country: "Switzerland", color: "#FFC300", neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "France" },
            { _id: new mongoose.Types.ObjectId(), country: "Italy" },
            { _id: new mongoose.Types.ObjectId(), country: "Austria" },
            { _id: new mongoose.Types.ObjectId(), country: "Germany" }
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Germany", color: "#00FF99", neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Denmark" },
            { _id: new mongoose.Types.ObjectId(), country: "Netherlands" },
            { _id: new mongoose.Types.ObjectId(), country: "Switzerland" },
            { _id: new mongoose.Types.ObjectId(), country: "France" },
            { _id: new mongoose.Types.ObjectId(), country: "Poland" },
            { _id: new mongoose.Types.ObjectId(), country: "Czech Republic" },
            { _id: new mongoose.Types.ObjectId(), country: "Austria" },
            { _id: new mongoose.Types.ObjectId(), country: "Belgium" }
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Albania", color: "#D52B1E", neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Greece" },
            { _id: new mongoose.Types.ObjectId(), country: "Macedonia, The Former Yugoslav Republic Of" },
            { _id: new mongoose.Types.ObjectId(), country: "Kosovo" },
            { _id: new mongoose.Types.ObjectId(), country: "Montenegro" },
            { _id: new mongoose.Types.ObjectId(), country: "Serbia" }
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "San Marino", color: "#FBB034", neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Italy" },
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Serbia", color: "#FFDB58", neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Kosovo" },
            { _id: new mongoose.Types.ObjectId(), country: "Croatia" },
            { _id: new mongoose.Types.ObjectId(), country: "Bosnia & Herzegovina" },
            { _id: new mongoose.Types.ObjectId(), country: "Montenegro" },
            { _id: new mongoose.Types.ObjectId(), country: "Macedonia, The Former Yugoslav Republic Of" },
            { _id: new mongoose.Types.ObjectId(), country: "Hungary" },
            { _id: new mongoose.Types.ObjectId(), country: "Romania" },
            { _id: new mongoose.Types.ObjectId(), country: "Bulgaria" }
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Macedonia, The Former Yugoslav Republic Of", color: "#007FFF", neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Greece" },
            { _id: new mongoose.Types.ObjectId(), country: "Bulgaria" },
            { _id: new mongoose.Types.ObjectId(), country: "Albania" },
            { _id: new mongoose.Types.ObjectId(), country: "Serbia" },
            { _id: new mongoose.Types.ObjectId(), country: "Kosovo" }
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Malta", color: "#008000", neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Italy" },
            { _id: new mongoose.Types.ObjectId(), country: "Libya" }
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Liechtenstein", color: "#F0D58B", neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Austria" },
            { _id: new mongoose.Types.ObjectId(), country: "Switzerland" }
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Ireland", color: "#800080", neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "United Kingdom" },
            { _id: new mongoose.Types.ObjectId(), country: "Northern Ireland" }
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Georgia", color: "#D3003F", neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Russia" },
            { _id: new mongoose.Types.ObjectId(), country: "Turkey" },
            { _id: new mongoose.Types.ObjectId(), country: "Armenia" },
            { _id: new mongoose.Types.ObjectId(), country: "Azerbaijan" },
            { _id: new mongoose.Types.ObjectId(), country: "Ukraine" }
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Greece",color: "#FF7F00", neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Albania" },
            { _id: new mongoose.Types.ObjectId(), country: "Bulgaria" },
            { _id: new mongoose.Types.ObjectId(), country: "Macedonia, The Former Yugoslav Republic Of" },
            { _id: new mongoose.Types.ObjectId(), country: "Turkey" },
            { _id: new mongoose.Types.ObjectId(), country: "Italy" }
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Russian Federation",color: "00FF00", neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Poland" },
            { _id: new mongoose.Types.ObjectId(), country: "Lithuania" }
        ]
    },
    
    {
        _id: new mongoose.Types.ObjectId(), country: "Andorra", color: "#1E90FF",neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Spain" },
            { _id: new mongoose.Types.ObjectId(), country: "France" }
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Israel", color: "#003366",neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Lebanon" },
            { _id: new mongoose.Types.ObjectId(), country: "Syria" },
            { _id: new mongoose.Types.ObjectId(), country: "Egypt" },
            { _id: new mongoose.Types.ObjectId(), country: "Jordan" }
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "France", color: "#ED2939",neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Switzerland" },
            { _id: new mongoose.Types.ObjectId(), country: "Italy" },
            { _id: new mongoose.Types.ObjectId(), country: "Spain" },
            { _id: new mongoose.Types.ObjectId(), country: "Andorra" },
            { _id: new mongoose.Types.ObjectId(), country: "Monaco" },
            { _id: new mongoose.Types.ObjectId(), country: "Belgium" },
            { _id: new mongoose.Types.ObjectId(), country: "Luxembourg" },
            { _id: new mongoose.Types.ObjectId(), country: "Germany" }
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Monaco", color: "#000000",neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "France" },
            { _id: new mongoose.Types.ObjectId(), country: "Italy" }
        ]
    },

    {
        _id: new mongoose.Types.ObjectId(), country: "Spain",color: "#008080", neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Portugal" },
            { _id: new mongoose.Types.ObjectId(), country: "Andorra" },
            { _id: new mongoose.Types.ObjectId(), country: "Gibraltar" },
            { _id: new mongoose.Types.ObjectId(), country: "Morocco" },
            { _id: new mongoose.Types.ObjectId(), country: "Mauritania" },

        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Sweden",color: "#CD202D", neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Denmark" },
            { _id: new mongoose.Types.ObjectId(), country: "Finland" },
            { _id: new mongoose.Types.ObjectId(), country: "Norway" }
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Denmark", color: "#FFC0CB",neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Sweden" },
            { _id: new mongoose.Types.ObjectId(), country: "Germany" },
            { _id: new mongoose.Types.ObjectId(), country: "Netherlands" }
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Netherlands", color: "#009900",neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Denmark" },
            { _id: new mongoose.Types.ObjectId(), country: "Germany" },
            { _id: new mongoose.Types.ObjectId(), country: "Belgium" },
            { _id: new mongoose.Types.ObjectId(), country: "France" }
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Belgium",color: "#C80815", neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Netherlands" },
            { _id: new mongoose.Types.ObjectId(), country: "Germany" },
            { _id: new mongoose.Types.ObjectId(), country: "Luxembourg" },
            { _id: new mongoose.Types.ObjectId(), country: "France" }
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Luxembourg",color: "#6C2780", neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Belgium" },
            { _id: new mongoose.Types.ObjectId(), country: "Germany" },
            { _id: new mongoose.Types.ObjectId(), country: "France" }
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Norway", color: "#E41B17",neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Sweden" },
            { _id: new mongoose.Types.ObjectId(), country: "Finland" },
            { _id: new mongoose.Types.ObjectId(), country: "Russia" }
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Finland",color: "#FFD700", neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Sweden" },
            { _id: new mongoose.Types.ObjectId(), country: "Norway" },
            { _id: new mongoose.Types.ObjectId(), country: "Russia" }
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Turkey", color: "#0066FF",neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Cyprus" },
            { _id: new mongoose.Types.ObjectId(), country: "Greece" },
            { _id: new mongoose.Types.ObjectId(), country: "Bulgaria" },
            { _id: new mongoose.Types.ObjectId(), country: "Georgia" },
            { _id: new mongoose.Types.ObjectId(), country: "Armenia" }
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Armenia",color: "#00A550", neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Azerbaijan" },
            { _id: new mongoose.Types.ObjectId(), country: "Georgia" },
            { _id: new mongoose.Types.ObjectId(), country: "Iran" },
            { _id: new mongoose.Types.ObjectId(), country: "Turkey" },
            { _id: new mongoose.Types.ObjectId(), country: "Russia" },
            { _id: new mongoose.Types.ObjectId(), country: "Ukraine" }
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Bulgaria",color: "#800000", neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Greece" },
            { _id: new mongoose.Types.ObjectId(), country: "Turkey" },
            { _id: new mongoose.Types.ObjectId(), country: "Serbia" },
            { _id: new mongoose.Types.ObjectId(), country: "Macedonia, The Former Yugoslav Republic Of" },
            { _id: new mongoose.Types.ObjectId(), country: "Romania" }
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(),
        country: "Azerbaijan",color: "#FF4500",
        neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Russia" },
            { _id: new mongoose.Types.ObjectId(), country: "Georgia" },
            { _id: new mongoose.Types.ObjectId(), country: "Armenia" },
            { _id: new mongoose.Types.ObjectId(), country: "Iran" },
            { _id: new mongoose.Types.ObjectId(), country: "Turkey" }
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Slovenia", color: "#C6AEC7",neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Italy" },
            { _id: new mongoose.Types.ObjectId(), country: "Austria" },
            { _id: new mongoose.Types.ObjectId(), country: "Hungary" },
            { _id: new mongoose.Types.ObjectId(), country: "Croatia" }
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Croatia", color: "#00A5E3",neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Hungary" },
            { _id: new mongoose.Types.ObjectId(), country: "Serbia" },
            { _id: new mongoose.Types.ObjectId(), country: "Bosnia & Herzegovina" },
            { _id: new mongoose.Types.ObjectId(), country: "Montenegro" },
            { _id: new mongoose.Types.ObjectId(), country: "Slovenia" },
            { _id: new mongoose.Types.ObjectId(), country: "Italy" },
            { _id: new mongoose.Types.ObjectId(), country: "Austria" }
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Montenegro",color: "#007F3F", neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Kosovo" },
            { _id: new mongoose.Types.ObjectId(), country: "Albania" },
            { _id: new mongoose.Types.ObjectId(), country: "Serbia" },
            { _id: new mongoose.Types.ObjectId(), country: "Bosnia & Herzegovina" },
            { _id: new mongoose.Types.ObjectId(), country: "Croatia" }
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Bosnia & Herzegovina",color: "#017f00", neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Kosovo" },
            { _id: new mongoose.Types.ObjectId(), country: "Croatia" },
            { _id: new mongoose.Types.ObjectId(), country: "Montenegro" },
            { _id: new mongoose.Types.ObjectId(), country: "Serbia" },
            { _id: new mongoose.Types.ObjectId(), country: "Macedonia, The Former Yugoslav Republic Of" },
            { _id: new mongoose.Types.ObjectId(), country: "Hungary" },
            { _id: new mongoose.Types.ObjectId(), country: "Romania" },
            { _id: new mongoose.Types.ObjectId(), country: "Bulgaria" },
            { _id: new mongoose.Types.ObjectId(), country: "Slovenia" }
          ]
    },
    
    {
        _id: new mongoose.Types.ObjectId(), country: "Cyprus", color: "#D51162",neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Turkey" },
            { _id: new mongoose.Types.ObjectId(), country: "Syria" },
            { _id: new mongoose.Types.ObjectId(), country: "Israel" },
            { _id: new mongoose.Types.ObjectId(), country: "Egypt" },
            { _id: new mongoose.Types.ObjectId(), country: "Greece" }
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Italy",color: "#AE1C28", neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Austria" },
            { _id: new mongoose.Types.ObjectId(), country: "Slovenia" },
            { _id: new mongoose.Types.ObjectId(), country: "Vatican City State" },
            { _id: new mongoose.Types.ObjectId(), country: "Switzerland" },
            { _id: new mongoose.Types.ObjectId(), country: "France" }
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "United Kingdom", color: "#EF2B2D",neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Ireland" },
            { _id: new mongoose.Types.ObjectId(), country: "Denmark" },
            { _id: new mongoose.Types.ObjectId(), country: "Netherlands" },
            { _id: new mongoose.Types.ObjectId(), country: "Switzerland" },
            { _id: new mongoose.Types.ObjectId(), country: "France" }
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Vatican City State",color: "#DC143C", neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Italy" },

        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Austria", color: "#FF0099",neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Italy" },
            { _id: new mongoose.Types.ObjectId(), country: "Hungary" },
            { _id: new mongoose.Types.ObjectId(), country: "Germany" },
            { _id: new mongoose.Types.ObjectId(), country: "Slovenia" },
            { _id: new mongoose.Types.ObjectId(), country: "Czech Republic" },
            { _id: new mongoose.Types.ObjectId(), country: "Switzerland" },
            { _id: new mongoose.Types.ObjectId(), country: "Slovakia" }
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Belarus",color: "#FCD116", neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Lithuania" },
            { _id: new mongoose.Types.ObjectId(), country: "Latvia" },
            { _id: new mongoose.Types.ObjectId(), country: "Poland" },
            { _id: new mongoose.Types.ObjectId(), country: "Ukraine" }
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Poland", color: "#003399",neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Russian Federation" },
            { _id: new mongoose.Types.ObjectId(), country: "Germany" },
            { _id: new mongoose.Types.ObjectId(), country: "Czech Republic" },
            { _id: new mongoose.Types.ObjectId(), country: "Slovakia" },
            { _id: new mongoose.Types.ObjectId(), country: "Ukraine" },
            { _id: new mongoose.Types.ObjectId(), country: "Belarus" },
            { _id: new mongoose.Types.ObjectId(), country: "Lithuania" }
            
        ]
    },




    {
        _id: new mongoose.Types.ObjectId(), country: "Lithuania",color: "#6699CC", neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Latvia" },
            { _id: new mongoose.Types.ObjectId(), country: "Belarus" },
            { _id: new mongoose.Types.ObjectId(), country: "Poland" },
            { _id: new mongoose.Types.ObjectId(), country: "Russia" },
            { _id: new mongoose.Types.ObjectId(), country: "Ukraine" },
            { _id: new mongoose.Types.ObjectId(), country: "Russian Federation" }
            
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Kosovo", color: "#FF0000",neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Albania" },
            { _id: new mongoose.Types.ObjectId(), country: "Montenegro" },
            { _id: new mongoose.Types.ObjectId(), country: "Serbia" },
            { _id: new mongoose.Types.ObjectId(), country: "Macedonia, The Former Yugoslav Republic Of" }
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Latvia", color: "#0D3692",neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Estonia" },
            { _id: new mongoose.Types.ObjectId(), country: "Russia" },
            { _id: new mongoose.Types.ObjectId(), country: "Belarus" },
            { _id: new mongoose.Types.ObjectId(), country: "Lithuania" },
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Estonia",color: "#005CAF", neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Russia" },
            { _id: new mongoose.Types.ObjectId(), country: "Latvia" },
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Russia", color: "#FFC400",neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Estonia" },
            { _id: new mongoose.Types.ObjectId(), country: "Latvia" },
            { _id: new mongoose.Types.ObjectId(), country: "Lithuania" },
            { _id: new mongoose.Types.ObjectId(), country: "Poland" },
            { _id: new mongoose.Types.ObjectId(), country: "Belarus" },
            { _id: new mongoose.Types.ObjectId(), country: "Ukraine" },
            { _id: new mongoose.Types.ObjectId(), country: "Finland" },
            { _id: new mongoose.Types.ObjectId(), country: "Norway" },
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Czech Republic", color: "#006AA7",neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Germany" },
            { _id: new mongoose.Types.ObjectId(), country: "Poland" },
            { _id: new mongoose.Types.ObjectId(), country: "Slovakia" },
            { _id: new mongoose.Types.ObjectId(), country: "Austria" },
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Slovakia",color: "#9900FF", neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Poland" },
            { _id: new mongoose.Types.ObjectId(), country: "Czech Republic" },
            { _id: new mongoose.Types.ObjectId(), country: "Hungary" },
            { _id: new mongoose.Types.ObjectId(), country: "Ukraine" },
            { _id: new mongoose.Types.ObjectId(), country: "Austria" },
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Ukraine", color: "#FFA500",neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Russia" },
            { _id: new mongoose.Types.ObjectId(), country: "Belarus" },
            { _id: new mongoose.Types.ObjectId(), country: "Hungary" },
            { _id: new mongoose.Types.ObjectId(), country: "Romania" },
            { _id: new mongoose.Types.ObjectId(), country: "Moldova" },
            { _id: new mongoose.Types.ObjectId(), country: "Bulgaria" },
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Moldova", color: "#CE1126",neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Romania" },
            { _id: new mongoose.Types.ObjectId(), country: "Ukraine" },
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Hungary", color: "#E6BE8A",neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Austria" },
            { _id: new mongoose.Types.ObjectId(), country: "Romania" },
            { _id: new mongoose.Types.ObjectId(), country: "Serbia" },
            { _id: new mongoose.Types.ObjectId(), country: "Croatia" },
            { _id: new mongoose.Types.ObjectId(), country: "Slovenia" },
            { _id: new mongoose.Types.ObjectId(), country: "Ukraine" },
            { _id: new mongoose.Types.ObjectId(), country: "Slovakia" },
            { _id: new mongoose.Types.ObjectId(), country: "Czech Republic" },
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Portugal",color: "#87CEFA", neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Spain" },
            { _id: new mongoose.Types.ObjectId(), country: "France" }
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Romania", color: "#FFA07A",neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Hungary" },
            { _id: new mongoose.Types.ObjectId(), country: "Ukraine" },
            { _id: new mongoose.Types.ObjectId(), country: "Moldova" },
            { _id: new mongoose.Types.ObjectId(), country: "Serbia" },
            { _id: new mongoose.Types.ObjectId(), country: "Bulgaria" }
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(), country: "Iceland",color: "#8B4513", neighbor_countries: [
            { _id: new mongoose.Types.ObjectId(), country: "Finland" },
            { _id: new mongoose.Types.ObjectId(), country: "Denmark" },
            { _id: new mongoose.Types.ObjectId(), country: "Norway" },
            { _id: new mongoose.Types.ObjectId(), country: "Sweden" },
            { _id: new mongoose.Types.ObjectId(), country: "Faroe Islands" },
            { _id: new mongoose.Types.ObjectId(), country: "Greenland" }

        ]
    },


    ]

    NeighborCountry.insertMany(neighbors_countries, (err, result) => {
        if (err) {
            console.log(err);
            res.sendStatus(400);
        } else {
            console.log(`${result.insertedCount} documents inserted`);
            res.sendStatus(200);
        }
    });
})

app.post('/createTeam', async (req, res) => {
    const NeighborCountry = mongoose.model('neighbor_countries', NeighborCountrySchema);

    let neighborCountry = await NeighborCountry.findOne({ country: req.body.originCountry });

    const team = {
        _id: new mongoose.Types.ObjectId(),
        originCountry: req.body.originCountry,
        numOfMistakes: 0,
        usedQuestions: [],
        users: [],
        occupiedCountries: [{ _id: new mongoose.Types.ObjectId(), country: req.body.originCountry }],
        potentialCountries: neighborCountry.neighbor_countries
    };
    const Game = mongoose.model('Game', GameSchema);

    Game.updateOne({ gameName: req.body.gameName }, { $addToSet: { teams: team } }, { _id: true, new: true }, (err, result) => {
        if (err) {
            console.log(err);
            res.sendStatus(400);
        } else {
            console.log(`${result.modifiedCount} documents updated`);
            res.sendStatus(200)
        }
    });
})
app.post('/submitTeams', async (req, res) => {
   // console.log("bbooooommmmm", req.body);
    for(i=0;i<req.body["teamsMembers"].length;i++){
   //     console.log("apppppp",req.body["teamsMembers"][i])
        createTeam(req.body["teamsMembers"][i]);
    }

})

app.post('/addTagsToQuestion', async (req, res) => {
    const question = await Question.findById(req.body.questionId);

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const tags = req.body.tags;
    question.tags.push(...tags); // Add the new tags to the existing tags array

    await question.save();

    res.status(200).json({ message: 'Tags added successfully' });
})

app.post('/createGame', async (req, res) => {

    const Game = mongoose.model('Game', GameSchema);

    const game = {
        gameName: req.body.gameName,
        startDate: Date.now(),
        occupiedCountries: [],
        teams: []
    };

    Game.create(game, (err, result) => {
        if (err) {
            console.log('Error inserting game: ', err);
            return;
        }
    });
    const games = await Game.find();

    // const game = {
    //     gameName: req.body.gameName,
    //     startDate: Date.now(),
    //     occupiedCountries: [],
    //     teams: []
    // };

    // db.collection('games').insertOne(game, (err, result) => {
    //     if (err) {
    //         console.log(err);
    //         res.sendStatus(400)
    //     } else {
    //         console.log(`Document inserted with _id: ${result.insertedId}`);
    //         res.sendStatus(200)
    //     }
    // });
})

app.post('/getAllUsers', async (req, res) => {
  //  console.log("in server chooosee")
    const User = mongoose.model('User', UserSchema);
    let users = await User.find({school: req.body.school, grade:req.body.grade}, 'name');
   // console.log("/getAllUsers", req.body, users)
    res.json(users);
});

app.post("/getTerritories", async (req, res) => {
    const Game = mongoose.model('Game', GameSchema);
    let game = await Game.findOne({
        gameName: req.body.gameName});
    teamsTerritories = game.teams.map(team=>{return {
        name: team.name,
        color: team.color,
        occupiedCountries: team.occupiedCountries,
        teamPoints: team.points
      };
    })
    res.send({teamsTerritories: teamsTerritories});

})

app.post('/addUserToTeam', async (req, res) => {
    const Game = mongoose.model('Game', GameSchema);

    Game.updateOne({ gameName: req.body.gameName, 'teams.originCountry': req.body.originCountry }, { '$addToSet': { 'teams.$.users': { name: req.body.username } } }, (err, result) => {
        if (err) {
     //       console.log(err);
            res.sendStatus(400);
        } else {
     //       console.log(`${result.modifiedCount} documents updated`);
            res.sendStatus(200);
        }
    });
})



app.post('/getIsraelPoly',  async (req, res) => {
    // Example usage
    const adminToFind = "Angola";
    const Geojson = mongoose.model('Geojson', geojsonSchema);
    // Find the document with the matching ADMIN property
    Geojson.findOne({ "properties.ADMIN": adminToFind })
      .then((document) => {
        if (document) {
          console.log("Found object:", document);
        } else {
          console.log("Object not found");
        }
      })
      .catch((error) => {
        console.error("Error retrieving object:", error);
      });
})
  


app.post('/addGeoJsons',  async (req, res) => {
    const Geojson = mongoose.model('Geojson', geojsonSchema);
    const geojsonFilePath = '/Users/hausmann/conquerTheWorld4/app/data/countries.json';
    fs.readFile(geojsonFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the geojson file:', err);
            return;
        }

        const geojsonData = JSON.parse(data);
        const features = geojsonData.features;

        let allCountries = [  'France', 'Germany', 'Belgium', 'Switzerland',  'Italy', 'Czech Republic', 'Austria', 'Slovenia',  'Croatia', 'Montenegro', 'Albania', 'Greece',  'Bulgaria', 'Hungary', 'Slovakia', 'Poland',  'Romania', 'Moldova', 'Ukraine', 'Belarus',  'Lithuania', 'Latvia', 'Estonia', 'Finland',  'Sweden', 'Norway', 'Turkey', 'Denmark', 'Macedonia',  'Bosnia & Herzegovina', 'Serbia', 'Luxembourg',  'Netherlands']

        features.forEach((feature) => {
            

            if(allCountries.includes(feature.properties.ADMIN)){
                const newGeojson = new Geojson(feature);
                console.log("newwwwwwwwwGeooo", newGeojson, feature)
                newGeojson.save((err) => {
                if (err) {
                    console.error('Error saving geojson data:', err);
                    return;
                }
                console.log('Geojson data saved successfully!');
                });
            }
        });
    })
    res.sendStatus(200);
})


app.post('/getGeo', async (req, res) => {
    console.log("innnnn getGEEEOEOOEOEOEEO")
    const Geojson = mongoose.model('Geojson', geojsonSchema);
    Geojson.findOne({ 'properties.ISO_A3': req.body.iso }, (err, document) => {
        if (err) {
          console.error('Error retrieving document:', err);
          return;
        }
      
        if (document) {
            const geoJSONObject = {
                type: document.type,
                properties: {
                  ADMIN: document.properties.ADMIN,
                  ISO_A3: document.properties.ISO_A3
                },
                geometry: {
                  type: document.geometry.type,
                  coordinates: document.geometry.coordinates
                }
              };
          console.log('Retrieved document:', geoJSONObject);
          res.json(geoJSONObject);
        } else {
          res.status(404).json({ error: 'Object not found' });
        }
      });
})
    



app.post('/addCountryToTeam', async (req, res) => {
    const Game = mongoose.model('Game', GameSchema);

    let occupiedCntr = await Game.findOne({
        gameName: req.body.gameName, occupiedCountries: {
            $elemMatch: {
                ountry: req.body.occupiedCountry
            }
        }
    });
    if (occupiedCntr == null) {
        const NeighborCountry = mongoose.model('neighbor_countries', NeighborCountrySchema);
        let neighborCountry = await NeighborCountry.findOne({
            country: req.body.occupiedCountry
        });

        Game.updateOne({ gameName: req.body.gameName, 'teams.originCountry': req.body.originCountry },
            {
                '$addToSet':
                {
                    'teams.$.occupiedCountries': { _id: new mongoose.Types.ObjectId(), country: req.body.occupiedCountry },
                    'teams.$.potentialCountries': { $each: neighborCountry.neighbor_countries }
                }
            }, (err, result) => {
                if (err) {
                    console.log(err);
                    res.sendStatus(400);
                } else {
                    console.log(`${result.modifiedCount} documents updated add country to team`);
                    Game.updateMany({ gameName: req.body.gameName },
                        {
                            $pull: {
                                "teams.$[].potentialCountries": { country: req.body.occupiedCountry }
                            }
                        },
                        (err, document) => {
                            if (err) {
                                res.sendStatus(400);
                                console.error(err);
                            } else {
                                res.sendStatus(200);
                                console.log(`${document.modifiedCount} documents updated country add team 2`);
                            }
                        })

                }
            });
    }
    else {
        res.json({
            message: 'ountry already occupied by other country'
        });
    }

})


app.post('/token', async (req, res) => {
    //const refreshToken = req.body.token
    
    const authHeader = req.headers["refreshtoken"];
    const refreshToken = authHeader
    console.log("hi 22in token",req.headers, req.headers.refreshtoken, req.headers["host"],refreshToken)
    if (refreshToken == null) return res.sendStatus(401)
    console.log("hi in token",refreshToken)
    //chnges
    const Refresh = mongoose.model('Refresh', refreshTokenSchema);
    const findToken = await Refresh.findOne({token:refreshToken})
    console.log("before send refresh Tokken1",findToken)
    if(!findToken){
        return res.status(403).json("Token has been expired, sign in again")
    }
    else{
        jwt.verify(refreshToken, process.env.ACCESS_TOKEN_SECRET_REFRESH, (err, user) => {
            if (err) return res.sendStatus(403)
            const accessToken = generateAccessToken({ name: user.name })
            console.log("before send refresh Tokken", accessToken)
            res.json({ accessToken: accessToken })
          })
    }

    // if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
    // jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    //   if (err) return res.sendStatus(403)
    //   const accessToken = generateAccessToken({ name: user.name })
    //   res.json({ accessToken: accessToken })
    // })
  })

  
  app.delete('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.sendStatus(204)
  })  

  app.post('/ccc', (req, res) => {
    console.log("in in ccc")
    checkCountriesLost("G1")
    res.sendStatus(204)
  })  


app.post('/login', async (req, res) => {
    console.log("in login fetch ", req.body)
    const user = {
        name: req.body.username,
        password: req.body.password
    };
    const Game = mongoose.model('Game', GameSchema);
    const User = mongoose.model('users', UserSchema);

    const Refresh = mongoose.model('Refresh', refreshTokenSchema);
    const user2 = await User.findOne({ name: req.body.username });
    if (user2 != null) {
        
        //res.sendStatus(200)
        console.log("798", user2)
        try {
            console.log("800")
            console.log("801", await bcrypt.compare(req.body.password, user2.password))
            if (await bcrypt.compare(req.body.password, user2.password)) {

                const accessToken = generateAccessToken({ user: req.body.username, role: user2.role })
                console.log("after2 generateeeeeee AccessToken", accessToken)

                const refreshToken = jwt.sign({ user: req.body.username, role: user2.role }, process.env.ACCESS_TOKEN_SECRET_REFRESH)
                console.log("after refresh generateeeeeee AccessToken")

                const findTokenInSchema = await Refresh.findOne({ user: user2._id })
                if (!findTokenInSchema) {
                    const refreshModel = new Refresh({
                        token: refreshToken,
                        user:user2._id
                    })
                    await refreshModel.save();
                }
                else {
                    let newToken = await Refresh.findOneAndUpdate({user:user2._id},{token: refreshToken},{new:true})
                }
                console.log("gammmmeeee");
                const game = await Game.findOne({ 'teams.users': { $in: [req.body.username] } });
                if (!game) {
                    console.log("hi im in 811333",accessToken)
                    console.log("lofin accseeesss token",accessToken )
                    res.json({ accessToken: accessToken, role:user2.role,school:user2.school, refreshToken:refreshToken})
                }
                else{
                console.log("gammmmeeee", game);
                const teamWithUsername = game.teams.find(team => team.users.includes(req.body.username));
                console.log("teaaaaammmmm", teamWithUsername);
                    // .populate({
                    //     path: 'teams',
                    //     match: { users: username }
                    // })
                    // .exec(function (err, game) {
                    //     if (err) {
                    //         // handle error
                    //     }
                    //     if (game) {
                    //         res.json({gameName:  accessToken: accessToken })
                    //     }
                    // });
                console.log("before send login", user2.school,accessToken)
                res.json({ school:user2.school, role:user2.role, accessToken: accessToken, gameName: game.gameName, teamName: teamWithUsername.name,refreshToken:refreshToken})
                }
            }
            else {
                res.status(400).send('invalid password');
            }
        }
        catch(error) {
            console.log("errroror login", error)
            console.log("hhhhhhh", await bcrypt.compare(req.body.password, user2.password));
            res.sendStatus(500);
        }
    }
    else {
        res.status(400).send('user not refistered');
    }
})

// function athenticateToken(req, res, next) {
//     console.log("hiii in authenticateeee")
//     const authHeader = req.headers['autherization'];
//     const token = authHeader
//     if (token == null) return res.sendStatus(400);
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
//         if (err) res.sendStatus(400);
//         req.user = user;
//         next();
//     })
// }

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

const arraysAreEqual = (arr1, arr2) => {
    if (arr1.length !== arr2.length) {
      return false;
    }
  
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) {
        return false;
      }
    }
  
    return true;
  };


  const canStartGame = async (gameName) => {
    const Game = mongoose.model('Game', GameSchema);
    const game = await Game.findOne({ gameName: gameName});
    return game.started
  }

// const canStartGame = async (gameName) => {
//     const Game = mongoose.model('Game', GameSchema);
//     const game = await Game.findOne({ gameName: gameName});
//     if (!game) {
//       // Handle case when the game doesn't exist
//       return false;
//     }
  
//     // Check if all teams have all their members entered
//     for (const team of game.teams) {
//         const sortedEnteredMembers = team.teamMembersEntered.sort();
//         const sortedUsers = team.users.map(user => user.toString()).sort();
//         console.log("i wannnnnttttt to seeee if the arraysss equal",sortedEnteredMembers ,sortedUsers)
//         if (!arraysAreEqual(sortedEnteredMembers, sortedUsers)) {
//             console.log("hiiiiiiii nooooottttt equuuuuaalallalala", sortedEnteredMembers,sortedUsers)
//             return false;
//         }
//     }
  
//     return true;
//   };
app.post('/startGame', async (req, res) => {
    const Game = mongoose.model('Game', GameSchema);
    const game = await Game.findOne({ gameName: req.body.gameName});


    try {
        const game = await Game.findOne({ gameName: req.body.gameName});
        if (!game) {   
          return res.status(404).json({ message: 'Game not found' });
        }   
        game.started = true;    
        await game.save();
        const game2 = await Game.findOne({ gameName: req.body.gameName});
        console.log("starteddddd", game2.started)
        return res.sendStatus(200);
      } catch (error) {
        console.error('Error starting game:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

})
//app.post('/addAllQuestionsToGame')

app.post('/isNeighborCountry', async (req, res) => {
    
    let canGetQuestion = await canStartGame(req.body.gameName)
    if (!canGetQuestion){
        res.json({
            message: 'wait for the teacher to start game'
        });
    }
    else{

    
    const Game = mongoose.model('Game', GameSchema);
    const Question = mongoose.models.questions || mongoose.model('questions', questionSchema);
    let neighborCountry = await Game.findOne({
        gameName: req.body.gameName, 'teams.name': req.body.teamName,
        'teams.potentialCountries': {
            $elemMatch: {
                country: req.body.neighborCountry
            }
        }
    });
    let team = await Game.findOne({ gameName: req.body.gameName, 'teams.name': req.body.teamName });
    const gameWithTeam = team.teams.filter(element => element.name === req.body.teamName);
    neighborCountry = gameWithTeam[0].originCountry ? neighborCountry : "originCountry"


    let occupiedCntr = await Game.findOne({
        gameName: req.body.gameName, occupiedCountries: {
            $elemMatch: {
                ountry: req.body.neighborCountry
            }
        }
    });


    if (neighborCountry != null && occupiedCntr == null) {
        const question = {
            difficulty: req.body.difficulty,
            subjet: req.body.subject
        };
        let team = await Game.findOne({ gameName: req.body.gameName, 'teams.name': req.body.teamName });
        const element = team.teams.filter(element => element.name === req.body.teamName);
        const returnedQuestion = await Question.findOne({
            // _id: { $in: team.questions.map(q => q._id)},
            _id: { $in: team.questions.filter(q => !element[0].usedQuestions.includes(q._id)).map(q => q._id)},
             difficulty: element[0].level.toLowerCase(), subjet: element[0].subject, class:element[0].grade
        });

        if (returnedQuestion != null) {
            Game.updateOne({ gameName: req.body.gameName, 'teams.name': req.body.teamName }, { '$addToSet': { 'teams.$.usedQuestions': returnedQuestion._id } }, (err, result) => {
                if (err) {
                    console.log(err);
                    res.sendStatus(400);
                } else {
                    console.log(`${result.modifiedCount} documents updated is neighbor `);
                    res.json({
                        message:'ok',
                        path: returnedQuestion.path,
                        answer: returnedQuestion.answer
                    });
                }
            });
        }
        else {
            res.json({
                message: 'no questions left'
            });
        }
    }
    if (neighborCountry == null) {
        res.json({
            message: 'no'
        });
    }
}
})

app.post('/addFriend'), async (req, res) => {
    const friends = {
        username: req.body.username,
        friendName: req.body.friendName
    };
    const User = mongoose.model('users', UserSchema);
    const first_friend = await User.findOne(req.body.username);
    if (first_friend != null) {
        const second_friend = await User.findOne(req.body.friendName);
        if (second_friend != null) {
            User.updateOne({ _id: first_friend._id }, { $addToSet: { friends: req.body.friendName } }, (err, result) => {
                if (err) {
                    console.log(err);
                    res.sendStatus(400)
                } else {
                    User.updateOne({ _id: second_friend._id }, { $addToSet: { friends: req.body.username } }, (err, result) => {
                        if (err) {
                            console.log(err);
                            res.sendStatus(400)
                        } else {
                            console.log(`${result.modifiedCount} documents updated`);
                            res.sendStatus(200)
                        }
                    });
                }
            });
        }
        res.Status(400).send("friend name is not a registered user")

    }
    else {
        res.Status(400).send("username is not registered");
    }
}

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
    const Question = mongoose.models.questions || mongoose.model('questions', questionSchema);
    // Question.deleteMany({}, (err, result) => {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         console.log(`${result.deletedCount} documents deleted`);
    //     }
    // });
    console.log("addQuestion body", req.body)
    const question = 
    // req.body.owner ? 
    {
        path: req.body.path,
        difficulty: req.body.difficulty,
        subjet: req.body.subject,
        answer: req.body.answer,
        owner: req.body.owner,
        class: req.body.class,
        name: req.body.name,
        tags: req.body.tags
    } 
    // :
    //     {
    //         path: req.body.path,
    //         difficulty: req.body.difficulty,
    //         subjet: req.body.subject,
    //         answer: req.body.answer
    //     }
        ;

    let newQuestion = await Question.create(question);
    console.log(`Document inserted with _id: ${newQuestion._id}`);
    res.status(200).send({ _id: newQuestion._id });
})

app.post('/getAllAdminQuestions', async (req, res) => {
    const Question = mongoose.models.questions || mongoose.model('questions', questionSchema);
    console.log("hiii in getAllAdminQuestions", {tags: req.body.tags,  owner: req.body.owner, class: req.body.class, difficulty: req.body.difficulty, subject: req.body.subject})
    if(req.body.tags.length==1 && req.body.tags[0]==''){
        let questions
        if(req.body.private){
            questions = await Question.find({ owner: req.body.owner, class: req.body.class, difficulty: req.body.difficulty, subject: req.body.subject});
            console.log("questionnnnssss private", questions)
        }
        else{
            questions = await Question.find({ $or: [{ owner: '' }, { owner: req.body.owner }], class: req.body.class, difficulty: req.body.difficulty, subject: req.body.subject});
            console.log("questionnnnssss noRTTTTT PRIVATE", questions)
        }
        
        res.json({"questions": questions})
    }else{
        let conditions
        if(req.body.private){
            conditions = {
                owner: req.body.owner
            };
        }
        else{
            conditions = {
                $or: [{ owner: '' }, { owner: req.body.owner }]
            }
        }
          if (req.body.tags) {
            conditions.tags = { $in: req.body.tags };
          }
          if (req.body.class) {
            conditions.class = req.body.class;
          }
          
          if (req.body.difficulty) {
            conditions.difficulty = req.body.difficulty;
          }
          
          if (req.body.subject) {
            conditions.subject = req.body.subject;
          }
          console.log("conddddidididitionnnnnnnnnnnnn", conditions)
          
          let questions = await Question.find(conditions);
          
        //let questions = await Question.find({ owner: req.body.owner, class: req.body.class, difficulty: req.body.difficulty, subject: req.body.subject, tags: { $in: req.body.tags }});
        console.log("in  agettttt alllll AddDDMINNNNNNN", questions)
        res.json({"questions": questions})
    }
})

app.post('/getAnsweredQuestions', async (req, res) => {
    console.log("getAnsweredQuestions 1057",req.body )
    const Game = mongoose.model('Game', GameSchema);
    let occupiedCntr = await Game.find({
        gameName: req.body.gameName,
    });
    //console.log("getAnsweredQuestions", occupiedCntr, occupiedCntr[0]["answers"])
    res.json({"questions": occupiedCntr[0]["answers"]})
})



app.post('/getQuestion', async (req, res) => {
    const question = {
        difficulty: req.body.difficulty,
        subjet: req.body.subject
    };
    let team = await db.collection('games').findOne({ gameName: req.body.gameName, 'teams.originCountry': req.body.originCountry });
    //let team = await db.collection('Teams').findOne({ originCountry: req.body.originCountry, gameId: game._id });
    const element = team.teams.filter(element => element.originCountry === req.body.originCountry);


    const returnedQuestion = await db.collection('questions').findOne({
        _id: { $nin: element[0].usedQuestions }, subjet: req.body.subject
    });


    db.collection('games').updateOne({ gameName: req.body.gameName, 'teams.originCountry': req.body.originCountry }, { '$addToSet': { 'teams.$.usedQuestions': returnedQuestion._id } }, (err, result) => {
        if (err) {
            console.log(err);
            res.sendStatus(400);
        } else {
            console.log(`${result.modifiedCount} documents updated getQuestion`);
            res.sendStatus(200);
        }
    });

    // db.collection('Teams').updateOne({ _id: team._id }, { $addToSet: { usedQuestions: returnedQuestion._id } }, (err, result) => {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         console.log(`${result.modifiedCount} documents updated`);
    //     }
    // });

})

// app.listen(port, () => {
//     console.log("server is at http://localhost:3001")
// })

