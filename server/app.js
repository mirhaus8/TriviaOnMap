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



// app.post('/getOriginsCountries', async (req, res) => {
//     const Game = mongoose.model('Game', GameSchema);
//     let occupiedCntr = await Game.find({
//         gameName: req.body.gameName,
//     });
//     let origins = occupiedCntr[0].teams.filter(element => element.originCountry)
//     origins = occupiedCntr[0].teams.map(element=>element.originCountry ? {team:element.name, origin: element.originCountry} : '');
//     res.send({originCountries: origins});
// })



app.post('/insert_neighbors', async (req, res) => {
    try {
        await insertNeighborCountries()
        res.sendStatus(200);
    }catch (error){
        res.sendStatus(500);
    }
})




// app.post('/createTeam', async (req, res) => {
//     const NeighborCountry = mongoose.model('neighbor_countries', NeighborCountrySchema);

//     let neighborCountry = await NeighborCountry.findOne({ country: req.body.originCountry });

//     const team = {
//         _id: new mongoose.Types.ObjectId(),
//         originCountry: req.body.originCountry,
//         numOfMistakes: 0,
//         usedQuestions: [],
//         users: [],
//         occupiedCountries: [{ _id: new mongoose.Types.ObjectId(), country: req.body.originCountry }],
//         potentialCountries: neighborCountry.neighbor_countries
//     };
//     const Game = mongoose.model('Game', GameSchema);

//     Game.updateOne({ gameName: req.body.gameName }, { $addToSet: { teams: team } }, { _id: true, new: true }, (err, result) => {
//         if (err) {
//             console.log(err);
//             res.sendStatus(400);
//         } else {
//             console.log(`${result.modifiedCount} documents updated`);
//             res.sendStatus(200)
//         }
//     });
// })
app.post('/submitTeams', async (req, res) => {
    for(i=0;i<req.body["teamsMembers"].length;i++){
        await createTeam(req.body["teamsMembers"][i]);
    }
    res.sendStatus(200)

})

// app.post('/addTagsToQuestion', async (req, res) => {
//     const question = await Question.findById(req.body.questionId);

//     if (!question) {
//       return res.status(404).json({ error: 'Question not found' });
//     }

//     const tags = req.body.tags;
//     question.tags.push(...tags); // Add the new tags to the existing tags array

//     await question.save();

//     res.status(200).json({ message: 'Tags added successfully' });
// })

// app.post('/createGame', async (req, res) => {

//     const Game = mongoose.model('Game', GameSchema);

//     const game = {
//         gameName: req.body.gameName,
//         startDate: Date.now(),
//         occupiedCountries: [],
//         teams: []
//     };

//     Game.create(game, (err, result) => {
//         if (err) {
//             console.log('Error inserting game: ', err);
//             return;
//         }
//     });
//     const games = await Game.find();

//     // const game = {
//     //     gameName: req.body.gameName,
//     //     startDate: Date.now(),
//     //     occupiedCountries: [],
//     //     teams: []
//     // };

//     // db.collection('games').insertOne(game, (err, result) => {
//     //     if (err) {
//     //         console.log(err);
//     //         res.sendStatus(400)
//     //     } else {
//     //         console.log(`Document inserted with _id: ${result.insertedId}`);
//     //         res.sendStatus(200)
//     //     }
//     // });
// })

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

// app.post('/addUserToTeam', async (req, res) => {
//     const Game = mongoose.model('Game', GameSchema);

//     Game.updateOne({ gameName: req.body.gameName, 'teams.originCountry': req.body.originCountry }, { '$addToSet': { 'teams.$.users': { name: req.body.username } } }, (err, result) => {
//         if (err) {
//      //       console.log(err);
//             res.sendStatus(400);
//         } else {
//      //       console.log(`${result.modifiedCount} documents updated`);
//             res.sendStatus(200);
//         }
//     });
// })



// app.post('/getIsraelPoly',  async (req, res) => {
//     // Example usage
//     const adminToFind = "Angola";
//     const Geojson = mongoose.model('Geojson', geojsonSchema);
//     // Find the document with the matching ADMIN property
//     Geojson.findOne({ "properties.ADMIN": adminToFind })
//       .then((document) => {
//         if (document) {
//           console.log("Found object:", document);
//         } else {
//           console.log("Object not found");
//         }
//       })
//       .catch((error) => {
//         console.error("Error retrieving object:", error);
//       });
// })
  


// app.post('/addGeoJsons',  async (req, res) => {
//     const Geojson = mongoose.model('Geojson', geojsonSchema);
//     const geojsonFilePath = '/Users/hausmann/conquerTheWorld4/app/data/countries.json';
//     fs.readFile(geojsonFilePath, 'utf8', (err, data) => {
//         if (err) {
//             console.error('Error reading the geojson file:', err);
//             return;
//         }

//         const geojsonData = JSON.parse(data);
//         const features = geojsonData.features;

//         let allCountries = [  'France', 'Germany', 'Belgium', 'Switzerland',  'Italy', 'Czech Republic', 'Austria', 'Slovenia',  'Croatia', 'Montenegro', 'Albania', 'Greece',  'Bulgaria', 'Hungary', 'Slovakia', 'Poland',  'Romania', 'Moldova', 'Ukraine', 'Belarus',  'Lithuania', 'Latvia', 'Estonia', 'Finland',  'Sweden', 'Norway', 'Turkey', 'Denmark', 'Macedonia',  'Bosnia & Herzegovina', 'Serbia', 'Luxembourg',  'Netherlands']

//         features.forEach((feature) => {
            

//             if(allCountries.includes(feature.properties.ADMIN)){
//                 const newGeojson = new Geojson(feature);
//                 console.log("newwwwwwwwwGeooo", newGeojson, feature)
//                 newGeojson.save((err) => {
//                 if (err) {
//                     console.error('Error saving geojson data:', err);
//                     return;
//                 }
//                 console.log('Geojson data saved successfully!');
//                 });
//             }
//         });
//     })
//     res.sendStatus(200);
// })


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
    // console.log("innnnn getGEEEOEOOEOEOEEO")
    // const Geojson = mongoose.model('Geojson', geojsonSchema);
    // Geojson.findOne({ 'properties.ISO_A3': req.body.iso }, (err, document) => {
    //     if (err) {
    //       console.error('Error retrieving document:', err);
    //       return;
    //     }
      
    //     if (document) {
    //         const geoJSONObject = {
    //             type: document.type,
    //             properties: {
    //               ADMIN: document.properties.ADMIN,
    //               ISO_A3: document.properties.ISO_A3
    //             },
    //             geometry: {
    //               type: document.geometry.type,
    //               coordinates: document.geometry.coordinates
    //             }
    //           };
    //       console.log('Retrieved document:', geoJSONObject);
    //       res.json(geoJSONObject);
    //     } else {
    //       res.status(404).json({ error: 'Object not found' });
    //     }
    //   });
})
    



// app.post('/addCountryToTeam', async (req, res) => {
//     const Game = mongoose.model('Game', GameSchema);

//     let occupiedCntr = await Game.findOne({
//         gameName: req.body.gameName, occupiedCountries: {
//             $elemMatch: {
//                 ountry: req.body.occupiedCountry
//             }
//         }
//     });
//     if (occupiedCntr == null) {
//         const NeighborCountry = mongoose.model('neighbor_countries', NeighborCountrySchema);
//         let neighborCountry = await NeighborCountry.findOne({
//             country: req.body.occupiedCountry
//         });

//         Game.updateOne({ gameName: req.body.gameName, 'teams.originCountry': req.body.originCountry },
//             {
//                 '$addToSet':
//                 {
//                     'teams.$.occupiedCountries': { _id: new mongoose.Types.ObjectId(), country: req.body.occupiedCountry },
//                     'teams.$.potentialCountries': { $each: neighborCountry.neighbor_countries }
//                 }
//             }, (err, result) => {
//                 if (err) {
//                     console.log(err);
//                     res.sendStatus(400);
//                 } else {
//                     console.log(`${result.modifiedCount} documents updated add country to team`);
//                     Game.updateMany({ gameName: req.body.gameName },
//                         {
//                             $pull: {
//                                 "teams.$[].potentialCountries": { country: req.body.occupiedCountry }
//                             }
//                         },
//                         (err, document) => {
//                             if (err) {
//                                 res.sendStatus(400);
//                                 console.error(err);
//                             } else {
//                                 res.sendStatus(200);
//                                 console.log(`${document.modifiedCount} documents updated country add team 2`);
//                             }
//                         })

//                 }
//             });
//     }
//     else {
//         res.json({
//             message: 'ountry already occupied by other country'
//         });
//     }

// })


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

    //const refreshToken = req.body.token
    
    // const authHeader = req.headers["refreshtoken"];
    // const refreshToken = authHeader
    // console.log("hi 22in token",req.headers, req.headers.refreshtoken, req.headers["host"],refreshToken)
    // if (refreshToken == null) return res.sendStatus(401)
    // console.log("hi in token",refreshToken)
    // //chnges
    // const Refresh = mongoose.model('Refresh', refreshTokenSchema);
    // const findToken = await Refresh.findOne({token:refreshToken})
    // console.log("before send refresh Tokken1",findToken)
    // if(!findToken){
    //     return res.status(403).json("Token has been expired, sign in again")
    // }
    // else{
    //     jwt.verify(refreshToken, process.env.ACCESS_TOKEN_SECRET_REFRESH, (err, user) => {
    //         if (err) return res.sendStatus(403)
    //         const accessToken = generateAccessToken({ name: user.name })
    //         console.log("before send refresh Tokken", accessToken)
    //         res.json({ accessToken: accessToken })
    //       })
    // }

    // if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
    // jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    //   if (err) return res.sendStatus(403)
    //   const accessToken = generateAccessToken({ name: user.name })
    //   res.json({ accessToken: accessToken })
    // })
  })

  
//   app.delete('/logout', (req, res) => {
//     refreshTokens = refreshTokens.filter(token => token !== req.body.token)
//     res.sendStatus(204)
//   })  

//   app.post('/ccc', (req, res) => {
//     console.log("in in ccc")
//     checkCountriesLost("G1")
//     res.sendStatus(204)
//   })  


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
    // console.log("in login fetch ", req.body)
    // const user = {
    //     name: req.body.username,
    //     password: req.body.password
    // };
    // const Game = mongoose.model('Game', GameSchema);
    // const User = mongoose.model('users', UserSchema);

    // const Refresh = mongoose.model('Refresh', refreshTokenSchema);
    // const user2 = await User.findOne({ name: req.body.username });
    // if (user2 != null) {
        
    //     //res.sendStatus(200)
    //     console.log("798", user2)
    //     try {
    //         console.log("800")
    //         console.log("801", await bcrypt.compare(req.body.password, user2.password))
    //         if (await bcrypt.compare(req.body.password, user2.password)) {

    //             const accessToken = generateAccessToken({ user: req.body.username, role: user2.role })
    //             console.log("after2 generateeeeeee AccessToken", accessToken)

    //             const refreshToken = jwt.sign({ user: req.body.username, role: user2.role }, process.env.ACCESS_TOKEN_SECRET_REFRESH)
    //             console.log("after refresh generateeeeeee AccessToken")

    //             const findTokenInSchema = await Refresh.findOne({ user: user2._id })
    //             if (!findTokenInSchema) {
    //                 const refreshModel = new Refresh({
    //                     token: refreshToken,
    //                     user:user2._id
    //                 })
    //                 await refreshModel.save();
    //             }
    //             else {
    //                 let newToken = await Refresh.findOneAndUpdate({user:user2._id},{token: refreshToken},{new:true})
    //             }
    //             console.log("gammmmeeee");
    //             const game = await Game.findOne({ 'teams.users': { $in: [req.body.username] } });
    //             if (!game) {
    //                 console.log("hi im in 811333",accessToken)
    //                 console.log("lofin accseeesss token",accessToken )
    //                 res.json({ accessToken: accessToken, role:user2.role,school:user2.school, refreshToken:refreshToken})
    //             }
    //             else{
    //             console.log("gammmmeeee", game);
    //             const teamWithUsername = game.teams.find(team => team.users.includes(req.body.username));
    //             console.log("teaaaaammmmm", teamWithUsername);
    //                 // .populate({
    //                 //     path: 'teams',
    //                 //     match: { users: username }
    //                 // })
    //                 // .exec(function (err, game) {
    //                 //     if (err) {
    //                 //         // handle error
    //                 //     }
    //                 //     if (game) {
    //                 //         res.json({gameName:  accessToken: accessToken })
    //                 //     }
    //                 // });
    //             console.log("before send login", user2.school,accessToken)
    //             res.json({ school:user2.school, role:user2.role, accessToken: accessToken, gameName: game.gameName, teamName: teamWithUsername.name,refreshToken:refreshToken})
    //             }
    //         }
    //         else {
    //             res.status(400).send('invalid password');
    //         }
    //     }
    //     catch(error) {
    //         console.log("errroror login", error)
    //         console.log("hhhhhhh", await bcrypt.compare(req.body.password, user2.password));
    //         res.sendStatus(500);
    //     }
    // }
    // else {
    //     res.status(400).send('user not refistered');
    // }
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

// const arraysAreEqual = (arr1, arr2) => {
//     if (arr1.length !== arr2.length) {
//       return false;
//     }
  
//     for (let i = 0; i < arr1.length; i++) {
//       if (arr1[i] !== arr2[i]) {
//         return false;
//       }
//     }
  
//     return true;
//   };


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
    // const Game = mongoose.model('Game', GameSchema);
    // const game = await Game.findOne({ gameName: req.body.gameName});


    // try {
    //     const game = await Game.findOne({ gameName: req.body.gameName});
    //     if (!game) {   
    //       return res.status(404).json({ message: 'Game not found' });
    //     }   
    //     game.started = true;    
    //     await game.save();
    //     const game2 = await Game.findOne({ gameName: req.body.gameName});
    //     console.log("starteddddd", game2.started)
    //     return res.sendStatus(200);
    //   } catch (error) {
    //     console.error('Error starting game:', error);
    //     return res.status(500).json({ message: 'Internal Server Error' });
    //   }

})
//app.post('/addAllQuestionsToGame')

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
//     let canGetQuestion = await canStartGame(req.body.gameName)
//     if (!canGetQuestion){
//         res.json({
//             message: 'wait for the teacher to start game'
//         });
//     }
//     else{

    
//     const Game = mongoose.model('Game', GameSchema);
//     const Question = mongoose.models.questions || mongoose.model('questions', questionSchema);
//     let neighborCountry = await Game.findOne({
//         gameName: req.body.gameName, 'teams.name': req.body.teamName,
//         'teams.potentialCountries': {
//             $elemMatch: {
//                 country: req.body.neighborCountry
//             }
//         }
//     });
//     let team = await Game.findOne({ gameName: req.body.gameName, 'teams.name': req.body.teamName });
//     const gameWithTeam = team.teams.filter(element => element.name === req.body.teamName);
//     neighborCountry = gameWithTeam[0].originCountry ? neighborCountry : "originCountry"


//     let occupiedCntr = await Game.findOne({
//         gameName: req.body.gameName, occupiedCountries: {
//             $elemMatch: {
//                 ountry: req.body.neighborCountry
//             }
//         }
//     });


//     if (neighborCountry != null && occupiedCntr == null) {
//         const question = {
//             difficulty: req.body.difficulty,
//             subjet: req.body.subject
//         };
//         let team = await Game.findOne({ gameName: req.body.gameName, 'teams.name': req.body.teamName });
//         const element = team.teams.filter(element => element.name === req.body.teamName);
//         const returnedQuestion = await Question.findOne({
//             // _id: { $in: team.questions.map(q => q._id)},
//             _id: { $in: team.questions.filter(q => !element[0].usedQuestions.includes(q._id)).map(q => q._id)},
//              difficulty: element[0].level.toLowerCase(), subjet: element[0].subject, class:element[0].grade
//         });

//         if (returnedQuestion != null) {
//             Game.updateOne({ gameName: req.body.gameName, 'teams.name': req.body.teamName }, { '$addToSet': { 'teams.$.usedQuestions': returnedQuestion._id } }, (err, result) => {
//                 if (err) {
//                     console.log(err);
//                     res.sendStatus(400);
//                 } else {
//                     console.log(`${result.modifiedCount} documents updated is neighbor `);
//                     res.json({
//                         message:'ok',
//                         path: returnedQuestion.path,
//                         answer: returnedQuestion.answer
//                     });
//                 }
//             });
//         }
//         else {
//             res.json({
//                 message: 'no questions left'
//             });
//         }
//     }
//     if (neighborCountry == null) {
//         res.json({
//             message: 'no'
//         });
//     }
// }
})

// app.post('/addFriend'), async (req, res) => {
//     const friends = {
//         username: req.body.username,
//         friendName: req.body.friendName
//     };
//     const User = mongoose.model('users', UserSchema);
//     const first_friend = await User.findOne(req.body.username);
//     if (first_friend != null) {
//         const second_friend = await User.findOne(req.body.friendName);
//         if (second_friend != null) {
//             User.updateOne({ _id: first_friend._id }, { $addToSet: { friends: req.body.friendName } }, (err, result) => {
//                 if (err) {
//                     console.log(err);
//                     res.sendStatus(400)
//                 } else {
//                     User.updateOne({ _id: second_friend._id }, { $addToSet: { friends: req.body.username } }, (err, result) => {
//                         if (err) {
//                             console.log(err);
//                             res.sendStatus(400)
//                         } else {
//                             console.log(`${result.modifiedCount} documents updated`);
//                             res.sendStatus(200)
//                         }
//                     });
//                 }
//             });
//         }
//         res.Status(400).send("friend name is not a registered user")

//     }
//     else {
//         res.Status(400).send("username is not registered");
//     }
// }

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
    // const Question = mongoose.models.questions || mongoose.model('questions', questionSchema);
    
    // console.log("addQuestion body", req.body)
    // const question = 
    // {
    //     path: req.body.path,
    //     difficulty: req.body.difficulty,
    //     subjet: req.body.subject,
    //     answer: req.body.answer,
    //     owner: req.body.owner,
    //     class: req.body.class,
    //     name: req.body.name,
    //     tags: req.body.tags
    // };

    // let newQuestion = await Question.create(question);
    // console.log(`Document inserted with _id: ${newQuestion._id}`);
    // res.status(200).send({ _id: newQuestion._id });
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
    // const Question = mongoose.models.questions || mongoose.model('questions', questionSchema);
    // console.log("hiii in getAllAdminQuestions", {tags: req.body.tags,  owner: req.body.owner, class: req.body.class, difficulty: req.body.difficulty, subject: req.body.subject})
    // if(req.body.tags.length==1 && req.body.tags[0]==''){
    //     let questions
    //     if(req.body.private){
    //         questions = await Question.find({ owner: req.body.owner, class: req.body.class, difficulty: req.body.difficulty, subject: req.body.subject});
    //         console.log("questionnnnssss private", questions)
    //     }
    //     else{
    //         questions = await Question.find({ $or: [{ owner: '' }, { owner: req.body.owner }], class: req.body.class, difficulty: req.body.difficulty, subject: req.body.subject});
    //         console.log("questionnnnssss noRTTTTT PRIVATE", questions)
    //     }
        
    //     res.json({"questions": questions})
    // }else{
    //     let conditions
    //     if(req.body.private){
    //         conditions = {
    //             owner: req.body.owner
    //         };
    //     }
    //     else{
    //         conditions = {
    //             $or: [{ owner: '' }, { owner: req.body.owner }]
    //         }
    //     }
    //       if (req.body.tags) {
    //         conditions.tags = { $in: req.body.tags };
    //       }
    //       if (req.body.class) {
    //         conditions.class = req.body.class;
    //       }
          
    //       if (req.body.difficulty) {
    //         conditions.difficulty = req.body.difficulty;
    //       }
          
    //       if (req.body.subject) {
    //         conditions.subject = req.body.subject;
    //       }
    //       console.log("conddddidididitionnnnnnnnnnnnn", conditions)
          
    //       let questions = await Question.find(conditions);
          
    //     //let questions = await Question.find({ owner: req.body.owner, class: req.body.class, difficulty: req.body.difficulty, subject: req.body.subject, tags: { $in: req.body.tags }});
    //     console.log("in  agettttt alllll AddDDMINNNNNNN", questions)
    //     res.json({"questions": questions})
    // }
})

app.post('/getAnsweredQuestions', async (req, res) => {
    let answeredQuestionRes = await answeredQuestions(req)
    if(answeredQuestionRes?.message === 'Internal Server Error' ){
        res.sendStatus(500);
     }
     if(answeredQuestionRes?.questions){
        res.json({"questions": answeredQuestionRes.questions})
     }
     else{
        res.sendStatus(400);
     }
    // const Game = mongoose.model('Game', GameSchema);
    // let occupiedCntr = await Game.find({
    //     gameName: req.body.gameName,
    // });
    // //console.log("getAnsweredQuestions", occupiedCntr, occupiedCntr[0]["answers"])
    // res.json({"questions": occupiedCntr[0]["answers"]})
})



// app.post('/getQuestion', async (req, res) => {
//     const question = {
//         difficulty: req.body.difficulty,
//         subjet: req.body.subject
//     };
//     let team = await db.collection('games').findOne({ gameName: req.body.gameName, 'teams.originCountry': req.body.originCountry });
//     //let team = await db.collection('Teams').findOne({ originCountry: req.body.originCountry, gameId: game._id });
//     const element = team.teams.filter(element => element.originCountry === req.body.originCountry);


//     const returnedQuestion = await db.collection('questions').findOne({
//         _id: { $nin: element[0].usedQuestions }, subjet: req.body.subject
//     });


//     db.collection('games').updateOne({ gameName: req.body.gameName, 'teams.originCountry': req.body.originCountry }, { '$addToSet': { 'teams.$.usedQuestions': returnedQuestion._id } }, (err, result) => {
//         if (err) {
//             console.log(err);
//             res.sendStatus(400);
//         } else {
//             console.log(`${result.modifiedCount} documents updated getQuestion`);
//             res.sendStatus(200);
//         }
//     });

//     // db.collection('Teams').updateOne({ _id: team._id }, { $addToSet: { usedQuestions: returnedQuestion._id } }, (err, result) => {
//     //     if (err) {
//     //         console.log(err);
//     //     } else {
//     //         console.log(`${result.modifiedCount} documents updated`);
//     //     }
//     // });

// })

// app.listen(port, () => {
//     console.log("server is at http://localhost:3001")
// })

