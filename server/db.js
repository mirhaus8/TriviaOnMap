// const mySQL = require('mysql2');


// let connection = mySQL.createConnection({
//     host: "localhost",
//     database: "conquertheworld",
//     user: "root",
//     password: "0542855387"
// })
// module.exports = connection;


const mongoose = require('mongoose');
const { NeighborCountrySchema, UserSchema, TeamSchema, GameSchema, questionSchema, DeletedGamesSchema } = require("./models");


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
            console.log('Error inserting game: ', err);
           
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
    console.log("team in db333", teamInfo);
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
    console.log("team in db", team, teamInfo.name);
    const Game = mongoose.model('Game', GameSchema);
    let alreadyExist = await Game.findOne({ gameName: teamInfo.gameName, 'teams.originCountry': teamInfo.originCountry });
    console.log("already", alreadyExist);
    if(alreadyExist != null){
        let addeduser = await addUserToTeam(teamInfo.gameName, teamInfo.originCountry, teamInfo.username)
    }
    else{
    

        Game.updateOne({ gameName: teamInfo.gameName }, { $addToSet: { teams: team, occupiedCountries: teamInfo.originCountry } }, { _id: true, new: true }, (err, result) => {
            if (err) {
                console.log(err);
                
            } else {
                console.log(`${result.modifiedCount} documents updated`);
                
            }
        });
    }
}

const addUserToTeam = (gameName, originCountry, username) => {
    const Game = mongoose.model('Game', GameSchema);

    x = Game.updateOne({ gameName: gameName, 'teams.originCountry': originCountry }, { '$addToSet': { 'teams.$.users': { name: username } } }, (err, result) => {
        if (err) {
            console.log(err);
            return false;
        } else {
            console.log(`${result.modifiedCount} documents updated`);
            return true;
        }
    });
    console.log("in addUserToTeam", x);
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
            console.log("addWRONG", updateTeam.teams.find((team) => team.name == errorInfo.teamName).errors, errorInfo)
    return {numOfErrors: updateTeam.teams.find((team) => team.name == errorInfo.teamName).errors.length, restOfTeams:updateTeam.teams.filter((team) => team.name != errorInfo.teamName).map(t=>t.name)};
    
}

const checkCountriesLost = async (gameName)=>{
    const Game = mongoose.model('Game', GameSchema);
    let currentGame= await Game.find({gameName:gameName})
    let allCountries = [  'France', 'Germany', 'Belgium', 'Switzerland',  'Italy', 'Czech Republic', 'Austria', 'Slovenia',  'Croatia', 'Montenegro', 'Albania', 'Greece',  'Bulgaria', 'Hungary', 'Slovakia', 'Poland',  'Romania', 'Moldova', 'Ukraine', 'Belarus',  'Lithuania', 'Latvia', 'Estonia', 'Finland',  'Sweden', 'Norway', 'Turkey', 'Denmark', 'Macedonia, The Former Yugoslav Republic Of',  'Bosnia & Herzegovina', 'Serbia', 'Luxembourg',  'Netherlands']
 console.log("length of occccc", currentGame[0].occupiedCountries.length, allCountries.length)
 
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
              console.log("hiiiii beforee send to windddsdsd", lo, wins)
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
    console.log("game without origin countryttttt -",occupiedCntr)
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
    console.log("hii innna dddddd aaaalllllll qqqqqqqq:", body)
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
    
        // Save the updated question
        await questionById.save();
        const game = await GameS.findOne({ gameName: body.gameName });
        console.log("gammmmememememmememmeme", game.gameName)
        await game.questions.push(question);
        console.log("gammmmememememmememmeme", game.questions)
        await game.save();
        console.log("game after add qqqqqqqqq:", game)
        return { message: 'good' };
      } catch (err) {
        console.log("hoiiiiii innnnne rrrororororor", err)
        return { message: 'somthing went wrong' };
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
                    console.log(err);
                    res.sendStatus(400);
                } else {
                    console.log(`${result.modifiedCount} documents updated`);
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
        console.log("teahcer groups", games)
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
    console.log("regular groups",body.role, games)
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
const deletGame = async(gameName)=>{
    const Game = mongoose.model('Game', GameSchema);
    // await Game.findOneAndUpdate(
    //     { gameName: gameName},
    //     {
    //       $set: {
    //         'ended': true,
    //       }
    //     }
    //   );
    console.log("hiii in delelelelleteeee Gamemememem,", gameName)
    await Game.deleteOne({gameName:gameName});

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
module.exports = { addTeamToLosers, addQuestionToGame, endGame, addWrongAnswerToTeam, getAllGroups, getQuestion, addCountryToTeam, addUserToTeam, createTeam, createGame, createCollections, checkCountriesLost, deletGame }

