const jwt = require('jsonwebtoken');


let needAuthTeacherRequests=[
    "/addQuestion",
    "/getAllAdminQuestions",
    "/getAnsweredQuestions",
    "/addQuestionToGame",
    "/getOriginsCountries",
    "/submitTeams",
    "/addTagsToQuestion",
    "/getAllUsers",
    "/getTerritories",
    "/games"

]

let needAuthStudentRequests=[
    "/isNeighborCountry",
    "/getQuestion",
    "/getOriginsCountries",
    "/getTerritories",
    "/games"
]


const athenticateToken = (req, res, next) =>{

    if((needAuthStudentRequests.includes(req.url) && req.body.role=="student") || (needAuthTeacherRequests.includes(req.url) && req.body.role=="teacher")){
        const authHeader = req.headers['auth'];
        const token = authHeader
        if (token == null) return res.sendStatus(400);
        else {jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) res.status(400).send("token invalid");
            else{req.user = user;
            next();}
        })}
    }
    else{
        next()
    }    
}

module.exports = { athenticateToken}