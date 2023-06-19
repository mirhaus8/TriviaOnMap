// const mySQL = require('mysql2');


// let connection = mySQL.createConnection({
//     host: "localhost",
//     database: "conquertheworld",
//     user: "root",
//     password: "0542855387"
// })
// module.exports = connection;


const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const { DeletedGamesSchema, geojsonSchema, NeighborCountrySchema, UserSchema, TeamSchema, GameSchema, questionSchema, refreshTokenSchema } = require("./models");


mongoose.connect('mongodb+srv://uri:dan@cluster0.lku9ksw.mongodb.net/?retryWrites=true&w=majority');

const db = mongoose.connection;

const createCollections = () => {
    //db.createCollection('users');
    //db.createCollection('friends');
    //db.createCollection('neighbor_countries');
    //db.createCollection('Teams');
    //db.createCollection('team_users');
    //db.createCollection('games');
    //db.createCollection('questions');
    //db.createCollection('usedQuestions');
}

const createGame = async (gameInfo) => {

    const Game = mongoose.model('Game', GameSchema);

    const game = {
        gameName: gameInfo.gameName,
        teacher: gameInfo.teacher,
        startDate: Date.now(),
        occupiedCountries: [],
        teams: [],
        questions: []
    };

    Game.create(game, (err, result) => {
        if (err) {
           
        }
    });
    //const games = await Game.find();
    //console.log("gammmess", games);

    // db.collection('games').insertOne(game, (err, result) => {
    //     if (err) {
    //         console.log(err);
    //         return false
    //     } else {
    //         let collection = db.collection('games');
    //         collection.find().toArray(function (err, docs) {
    //             if (err) {
    //                 return false;
    //             } else {
    //                 return docs;
    //             }
    //         });
    //     }

    // });
    // let x = await db.collection('games').find().toArray(function (err, docs) {
    //     if (err) {
    //         return false;
    //     } else {
    //         return docs;
    //     }
    // });
}

const createTeam = async (teamInfo) => {
    const NeighborCountry = mongoose.model('neighbor_countries', NeighborCountrySchema);
    let neighborCountry = await NeighborCountry.findOne({ country: teamInfo.originCountry });

    const team = {
        _id: new mongoose.Types.ObjectId(),
        color: teamInfo.originCountry ? neighborCountry.color : "",
        name: teamInfo.name,
        originCountry: teamInfo.originCountry ? teamInfo.originCountry : '',
        numOfMistakes: 0,
        usedQuestions: [],
        users: teamInfo.members,
        level: teamInfo.level?teamInfo.level:"",
        subject:teamInfo.subject?teamInfo.subject:"",
        grade: teamInfo.grade?teamInfo.grade:"",
        occupiedCountries: teamInfo.originCountry ? [{ _id: new mongoose.Types.ObjectId(), country: teamInfo.originCountry }] : [],
        potentialCountries: neighborCountry ? neighborCountry.neighbor_countries : []
    };
    const Game = mongoose.model('Game', GameSchema);
    let alreadyExist = await Game.findOne({ gameName: teamInfo.gameName, 'teams.originCountry': teamInfo.originCountry });
    if(alreadyExist != null){
        let addeduser = await addUserToTeam(teamInfo.gameName, teamInfo.originCountry, teamInfo.username)
    }
    else{
    

        Game.updateOne({ gameName: teamInfo.gameName }, { $addToSet: { teams: team, occupiedCountries: teamInfo.originCountry } }, { _id: true, new: true }, (err, result) => {
            if (err) {
                
            } else {
                
            }
        });
    }
}

const addUserToTeam = (gameName, originCountry, username) => {
    const Game = mongoose.model('Game', GameSchema);

    x = Game.updateOne({ gameName: gameName, 'teams.originCountry': originCountry }, { '$addToSet': { 'teams.$.users': { name: username } } }, (err, result) => {
        if (err) {
            return false;
        } else {
            return true;
        }
    });
}


const getOriginCountries = async (gameName)=>{
    const Game = mongoose.model('Game', GameSchema);
    let occupiedCntr = await Game.find({
        gameName: gameName,
    });
    
    let origins = occupiedCntr[0].teams.map(element=>element.originCountry);
    return origins
}

const addWrongAnswerToTeam = async (errorInfo)=>{
    const Game = mongoose.model('Game', GameSchema);
    const answer = {
        username: errorInfo.username,
        team:errorInfo.teamName,
        questionPath: errorInfo.questionPath,
    }
    let updateTeam = await Game.findOneAndUpdate({ gameName: errorInfo.gameName, 'teams.name': errorInfo.teamName },
            {
                '$addToSet':
                {
                    'teams.$.errors': answer
                }
            },{ new: true })
    return {numOfErrors: updateTeam.teams.find((team) => team.name == errorInfo.teamName).errors.length, restOfTeams:updateTeam.teams.filter((team) => team.name != errorInfo.teamName).map(t=>t.name)};
    
}

const checkCountriesLost = async (gameName)=>{
    const Game = mongoose.model('Game', GameSchema);
    let currentGame= await Game.find({gameName:gameName})
    let allCountries = [  'France', 'Germany', 'Belgium', 'Switzerland',  'Italy', 'Czech Republic', 'Austria', 'Slovenia',  'Croatia', 'Montenegro', 'Albania', 'Greece',  'Bulgaria', 'Hungary', 'Slovakia', 'Poland',  'Romania', 'Moldova', 'Ukraine', 'Belarus',  'Lithuania', 'Latvia', 'Estonia', 'Finland',  'Sweden', 'Norway', 'Turkey', 'Denmark', 'Macedonia, The Former Yugoslav Republic Of',  'Bosnia & Herzegovina', 'Serbia', 'Luxembourg',  'Netherlands']
 
    if(currentGame[0].occupiedCountries.length>=allCountries.length){


        const uniqueArray1 = currentGame[0].occupiedCountries.filter(item => !allCountries.includes(item));

        const uniqueArray2 = allCountries.filter(item => !currentGame[0].occupiedCountries.includes(item));




        let allCountriesOccupied = allCountries.every(item => currentGame[0].occupiedCountries.includes(item));
        let endGame = await Game.findOne({ gameName:gameName })
        if (endGame && allCountriesOccupied) {
            const teams = endGame.teams.filter(team => !team.lost);
            const maxPoints = teams.reduce((maxPoints, currentTeam) => {
                if (currentTeam.points > maxPoints) {
                  return currentTeam.points;
                }
                return maxPoints;
              }, 0);
              
              const teamsWithMaxPoints = teams.filter(team => team.points === maxPoints);
              const teamsWithoutMaxPoints = teams.filter(team => team.points !== maxPoints);
              let lo = teamsWithoutMaxPoints.map(element=>element.name);
            //   Game.updateOne(
            //     { gameName:gameName },
            //     { $push: { losers: { $each: lo } } })
                Game.updateOne(
                { gameName:gameName , 'teams.name': { $in: lo } },
                { $set: { 'teams.$.lost': true } },)
              let wins = teamsWithMaxPoints.map(element=>element.name);
              return {"losts": lo, "wins": wins};
        }
  
    }
    let occupiedCntr = await Game.find({
        gameName: gameName,
        teams: {
            $elemMatch: {
                potentialCountries: [],
                originCountry: { $ne: "" }
            }
        }
    });
    if(occupiedCntr.length!=0){
        let losts = occupiedCntr[0].teams.filter(element => element.potentialCountries.length == 0);
        let lo = losts.map(element=>element.name);

        await Game.updateMany(
            { gameName: gameName, teams: {
                $elemMatch: {
                    potentialCountries: [],
                    originCountry: { $ne: "" }
                }
            } },
            { $set: { 'teams.$.lost': true } })

        let wins = occupiedCntr[0].teams.filter(element => element.potentialCountries.length != 0);
        wins = wins.map(element=>element.name);
        return {"losts": lo, "wins": wins};
    }
    return []
}

const addQuestionToGame = async (body) =>{
    const question = {
        _id: body.id,
        difficulty: body.difficulty,
        class: body.class,
    }
    
    const GameS = mongoose.models.Game || mongoose.model('Game', GameSchema);;
    const Question = mongoose.models.questions || mongoose.model('questions', questionSchema);
    try {
        const questionById = await Question.findById(body.id);
        if (!questionById) {
            return { message: 'Question not found' };
        }
        questionById.tags.push(...body.tags);
        await questionById.save();
        const game = await GameS.findOne({ gameName: body.gameName });
        await game.questions.push(question);
        await game.save();
        return { message: 'good' };
      } catch (err) {
        return { message: 'somthing went wrong' };
      }  
}


const register = async (body) => {
    try {
          const hashedPassword = await bcrypt.hash(body.password, 10)
          const user = {
              name: body.username,
              password: hashedPassword,
              role: body.role,
              school: body.school,
              grade: body.grade,
              friends: []
          };
          const User = mongoose.model('users', UserSchema);
          const existingUser = await User.findOne({ name: body.username });
          if (existingUser) {
              return { message: 'Username already exists' };
          }
          try {
            const result = await User.create(user);
            return { message: 'Ok' };
          } catch (err) {
            return { message: 'Something went wrong' };
          }
      } catch {
        return { message: 'Something went wrong' };
      }
}

const addCountryToTeam = async (teamCountryInfo) => {
    const answer = {
        username: teamCountryInfo.username,
        team:teamCountryInfo.teamName,
        questionPath: teamCountryInfo.questionPath,
    }
    const Game = mongoose.model('Game', GameSchema);
    let game = await Game.findOne({
        gameName: teamCountryInfo.gameName});
    let occupiedCntr = await Game.findOne({
        gameName: teamCountryInfo.gameName, occupiedCountries: {
            $elemMatch: {
                ountry: teamCountryInfo.occupiedCountry
            }
        }
    });
    //console.log("teamCountryInfodsdasdasdsasdsasd", teamCountryInfo)
    let currentGameWithoutOrigin = await Game.findOne({
        gameName: teamCountryInfo.gameName, 'teams.name': teamCountryInfo.teamName, 'teams.originCountry': ""
    });
    if (occupiedCntr == null) {
        const NeighborCountry = mongoose.models.neighbor_countries || mongoose.model('neighbor_countries', NeighborCountrySchema);
        let neighborCountry = await NeighborCountry.findOne({
            country: teamCountryInfo.occupiedCountry
        });
        let addedPotential = neighborCountry.neighbor_countries.filter(element => !game.occupiedCountries.includes(element.country))

        let updateTeams = await Game.findOneAndUpdate({ gameName: teamCountryInfo.gameName, 'teams.name': teamCountryInfo.teamName },
            {
                '$addToSet':
                {
                    'teams.$.occupiedCountries': { _id: new mongoose.Types.ObjectId(), country: teamCountryInfo.occupiedCountry },
                    'teams.$.potentialCountries': { $each: addedPotential },
                    'occupiedCountries': teamCountryInfo.occupiedCountry,
                    'answers': answer
                },
                '$inc': {
                  'teams.$.points': addedPotential.length
                }
            })
        let updatePotential = await Game.updateMany({ gameName: teamCountryInfo.gameName },
            {
                $pull: {
                    "teams.$[].potentialCountries": { country: teamCountryInfo.occupiedCountry }
                }
            })
        if(currentGameWithoutOrigin){
            await Game.findOneAndUpdate(
                { gameName: teamCountryInfo.gameName, 'teams.name': teamCountryInfo.teamName},
                {
                  $set: {
                    'teams.$.originCountry': teamCountryInfo.occupiedCountry,
                    'teams.$.color': neighborCountry.color
                  }
                }
              );
        }
        return {"points":addedPotential.length, "color": neighborCountry.color}

    }
    else {
        return false
    }
}

const getQuestion = async (teamInfo) => {
    const Game = mongoose.model('Game', GameSchema);
    const Question = mongoose.model('questions', questionSchema);
    let neighborCountry = await Game.findOne({
        gameName: req.body.gameName, 'teams.originCountry': req.body.originCountry,
        'teams.potentialCountries': {
            $elemMatch: {
                country: req.body.neighborCountry
            }
        }
    });


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
        let team = await Game.findOne({ gameName: req.body.gameName, 'teams.originCountry': req.body.originCountry });
        const element = team.teams.filter(element => element.originCountry === req.body.originCountry);
        const returnedQuestion = await Question.findOne({
            _id: { $nin: element[0].usedQuestions }, difficulty: req.body.difficulty, subjet: req.body.subject
        });

        if (returnedQuestion != null) {
            Game.updateOne({ gameName: req.body.gameName, 'teams.originCountry': req.body.originCountry }, { '$addToSet': { 'teams.$.usedQuestions': returnedQuestion._id } }, (err, result) => {
                if (err) {
                    res.sendStatus(400);
                } else {
                    res.json({
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

const getAllGroups = async (body) => {
    const Game = mongoose.model('Game', GameSchema);
    const DeletedGames = mongoose.model('DeletedGames', DeletedGamesSchema);
    if(body.role == "teacher"){
        let games = await Game.find({teacher: body.username})
        return games
    }
    if(body.role == "student"){
        const games = await Game.find({ 'teams.users': { $in: [body.username] }, 'ended': false });
        let returnedGames=[]
        for(let i=0;i<games.length;i++){
            //const team = games[i].teams.find(team => team.users.includes(body.username));
            //if (team) {
            //const teamName = team.name;
            const deletedGame = await DeletedGames.findOne({ name: games[i].gameName, users: { $elemMatch: { $eq: body.username } } });
            if(!deletedGame){
                returnedGames.push(games[i])
            }
            //}
        }
        return returnedGames
    }
    let games = await Game.find({teacher: ""})
    return games
}
const endGame= async(gameName)=>{
    const Game = mongoose.model('Game', GameSchema);
    await Game.findOneAndUpdate(
        { gameName: gameName},
        {
          $set: {
            'ended': true,
          }
        }
      );
    //await Game.deleteOne({gameName:gameName});
}
const deleteGame = async(gameName)=>{
    const Game = mongoose.model('Game', GameSchema);
    await Game.deleteOne({gameName:gameName});

}


const getAllUsers = async (school, grade) => {
    try {
        const User = mongoose.model('User', UserSchema);
        let users = await User.find({ school: school, grade: grade }, 'name');
        return users
    } catch (err) {
        return { message: "Something went wrong" }
    }
}

function generateAccessToken(user){
    return jwt.sign({ user: user.username, role: user.role }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '30m'})

}

const login = async (body) =>{
    const user = {
        name: body.username,
        password: body.password
    };
    const Game = mongoose.model('Game', GameSchema);
    const User = mongoose.model('users', UserSchema);

    const Refresh = mongoose.model('Refresh', refreshTokenSchema);
    const user2 = await User.findOne({ name: body.username });
    if (user2 != null) {
        
        try {
            if (await bcrypt.compare(body.password, user2.password)) {

                const accessToken = generateAccessToken({ user: body.username, role: user2.role })

                const refreshToken = jwt.sign({ user: body.username, role: user2.role }, process.env.ACCESS_TOKEN_SECRET_REFRESH)

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
                const game = await Game.findOne({ 'teams.users': { $in: [body.username] } });
                if (!game) {
                    return { accessToken: accessToken, role:user2.role,school:user2.school, refreshToken:refreshToken}
                }
                else{
                const teamWithUsername = game.teams.find(team => team.users.includes(body.username));
                return { school:user2.school, role:user2.role, accessToken: accessToken, gameName: game.gameName, teamName: teamWithUsername.name,refreshToken:refreshToken}
                }
            }
            else {
                return {message:'invalid password'};
            }
        }
        catch(error) {
            return {message: 'Something went wrong'}
        }
    }
    else {
        return {message: 'user not refistered'}
      
    }
}

const startGame = async (body)=>{
    const Game = mongoose.model('Game', GameSchema);
    const game = await Game.findOne({ gameName: body.gameName});


    try {
        const game = await Game.findOne({ gameName: body.gameName});
        if (!game) {   
          return { message: 'Game not found' };
        }   
        game.started = true;    
        await game.save();
        const game2 = await Game.findOne({ gameName: body.gameName});
        return { message: 'Ok' };
      } catch (error) {
        return { message: 'Internal Server Error' };
      }
}

const canStartGame = async (gameName) => {
    const Game = mongoose.model('Game', GameSchema);
    const game = await Game.findOne({ gameName: gameName});
    return game.started
  }

const isNeighborCountry = async (body) => {
    let canGetQuestion = await canStartGame(body.gameName);
    if (!canGetQuestion) {
      return {
        message: 'Wait for the teacher to start the game'
      };
    } else {
  
      const Game = mongoose.model('Game', GameSchema);
      const Question = mongoose.models.questions || mongoose.model('questions', questionSchema);
  
      let neighborCountry = await Game.findOne({
        gameName: body.gameName,
        'teams.name': body.teamName,
        'teams.potentialCountries': {
          $elemMatch: {
            country: body.neighborCountry
          }
        }
      });
  
      let team = await Game.findOne({ gameName: body.gameName, 'teams.name': body.teamName });
      const gameWithTeam = team.teams.filter(element => element.name === body.teamName);
      neighborCountry = gameWithTeam[0].originCountry ? neighborCountry : "originCountry";
  
  
      let occupiedCntr = await Game.findOne({
        gameName: body.gameName,
        occupiedCountries: {
          $elemMatch: {
            country: body.neighborCountry
          }
        }
      });
  
      if (neighborCountry !== null && occupiedCntr === null) {
  
        const question = {
          difficulty: body.difficulty,
          subjet: body.subject
        };
  
        let team = await Game.findOne({ gameName: body.gameName, 'teams.name': body.teamName });
        const element = team.teams.filter(element => element.name === body.teamName);
  
        const returnedQuestion = await Question.findOne({
          _id: {
            $in: team.questions
              .filter(q => !element[0].usedQuestions.includes(q._id))
              .map(q => q._id)
          },
          difficulty: element[0].level.toLowerCase(),
          subjet: element[0].subject,
          class: element[0].grade
        });
  
        if (returnedQuestion !== null) {
  
          try {
            const result = await Game.updateOne(
              { gameName: body.gameName, 'teams.name': body.teamName },
              { '$addToSet': { 'teams.$.usedQuestions': returnedQuestion._id } }
            );
  
  
            return {
              message: 'ok',
              path: returnedQuestion.path,
              answer: returnedQuestion.answer
            };
          } catch (err) {
            return { message: 'Something went wrong' };
          }
        } else {
          return { message: 'no questions left' };
        }
      }
  
      if (neighborCountry === null) {
        return { message: 'no' };
      }
    }
  };
  

const addQuestion = async (body) =>{
    try {
        const Question = mongoose.models.questions || mongoose.model('questions', questionSchema);
        
        const question = 
        {
            path: body.path,
            difficulty: body.difficulty,
            subjet: body.subject,
            answer: body.answer,
            owner: body.owner,
            class: body.class,
            name: body.name,
            tags: body.tags
        };

        let newQuestion = await Question.create(question);
        return { _id: newQuestion._id };
    } catch (error) {
        return { message: 'Internal Server Error' };
    }
}

const getAllAdminQuestions = async (req) =>{
    try{
    const Question = mongoose.models.questions || mongoose.model('questions', questionSchema);
    if(req.body.tags.length==1 && req.body.tags[0]==''){
        let questions
        if(req.body.private){
            questions = await Question.find({ owner: req.body.owner, class: req.body.class, difficulty: req.body.difficulty, subject: req.body.subject});
        }
        else{
            questions = await Question.find({ $or: [{ owner: '' }, { owner: req.body.owner }], class: req.body.class, difficulty: req.body.difficulty, subject: req.body.subject});
        }
        
        return {questions: questions}
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
          
          let questions = await Question.find(conditions);
          
        //let questions = await Question.find({ owner: req.body.owner, class: req.body.class, difficulty: req.body.difficulty, subject: req.body.subject, tags: { $in: req.body.tags }});
        return {questions: questions}
    }
}catch (error) {
    return { message: 'Internal Server Error' };
}
}

const answeredQuestions = async (req) =>{
    try{
    const Game = mongoose.model('Game', GameSchema);
    let occupiedCntr = await Game.find({
        gameName: req.body.gameName,
    });
    return {questions: occupiedCntr[0]["answers"]}
}catch (error) {
    return { message: 'Internal Server Error' };
}
}

// const getQuestionForRoute = async (req) =>{
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


//     // db.collection('games').updateOne({ gameName: req.body.gameName, 'teams.originCountry': req.body.originCountry }, { '$addToSet': { 'teams.$.usedQuestions': returnedQuestion._id } }, (err, result) => {
//     //     if (err) {
//     //         console.log(err);
//     //         res.sendStatus(400);
//     //     } else {
//     //         console.log(`${result.modifiedCount} documents updated getQuestion`);
//     //         res.sendStatus(200);
//     //     }
//     // });


//     try {
//         const result = await db.collection('games').updateOne(
//           { gameName: req.body.gameName, 'teams.originCountry': req.body.originCountry },
//           { '$addToSet': { 'teams.$.usedQuestions': returnedQuestion._id } }
//         );
        
//         res.sendStatus(200);
//       } catch (err) {
//         console.log(err);
//         res.sendStatus(400);
//       }
      
// }

const getTerritories = async (gameName) => {
    try {
        const Game = mongoose.model('Game', GameSchema);
        let game = await Game.findOne({
            gameName: gameName
        });
        let teamsTerritories = game.teams.map(team => {
            return {
                name: team.name,
                color: team.color,
                occupiedCountries: team.occupiedCountries,
                teamPoints: team.points
            };
        })
        return teamsTerritories
    }catch(err){
        return { message: "Something went wrong" }
    }
}

const getGeo = async (req) =>{
    try {
        const Geojson = mongoose.model('Geojson', geojsonSchema);
        const document = await Geojson.findOne({ 'properties.ISO_A3': req.body.iso }).exec();
      
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
          
          return {geoJSONObject:geoJSONObject};
        } else {
          return { message: "Something went wrong" };
        }
      } catch (err) {
        return { message: "Something went wrong" };
      }
}

const getToken = async(req) =>{
    try {
        const authHeader = req.headers["refreshtoken"];
        const refreshToken = authHeader;
      
        if (refreshToken == null) {
          return { message: "Something went wrong" };
        }
      
      
        const Refresh = mongoose.model('Refresh', refreshTokenSchema);
        const findToken = await Refresh.findOne({ token: refreshToken });
      
      
        if (!findToken) {
          return { message: "Token has expired, sign in again" };
        } else {
          try {
            const user = jwt.verify(refreshToken, process.env.ACCESS_TOKEN_SECRET_REFRESH);
            const accessToken = generateAccessToken({ name: user.name });
            return { accessToken: accessToken };
          } catch (err) {
            return { message: "Something went wrong" };
          }
        }
      } catch (err) {
        return { message: "Something went wrong" };
      }
      
}

const addTeamToLosers = async(gameName, teamName)=>{
    const DeletedGames = mongoose.model('DeletedGames', DeletedGamesSchema);
    const Game = mongoose.model('Game', GameSchema);

    const game = await Game.findOne({ gameName: gameName });
    const team = game.teams.find((t) => t.name == teamName);

    const teamMembers = team.users;

    const newDeletedGames = new DeletedGames({
        _id: new mongoose.Types.ObjectId(),
        name: gameName,
        users: teamMembers,
    });

    await newDeletedGames.save();

}
module.exports = {getToken, getGeo, answeredQuestions, getAllAdminQuestions,addQuestion, isNeighborCountry, startGame, login, getTerritories, getAllUsers, register, addTeamToLosers, addQuestionToGame, endGame, addWrongAnswerToTeam, getAllGroups, getQuestion, addCountryToTeam, addUserToTeam, createTeam, createGame, createCollections, checkCountriesLost, deleteGame }

