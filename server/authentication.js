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
    console.log("hii in authenti", req.url, req.body)

    if((needAuthStudentRequests.includes(req.url) && req.body.role=="student") || (needAuthTeacherRequests.includes(req.url) && req.body.role=="teacher")){
        console.log("hii in authenti", req.url)
        const authHeader = req.headers['auth'];
        const token = authHeader
        console.log("token in authenticate", req.headers)
        if (token == null) return res.sendStatus(400);
        else {jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) res.status(400).send("token invalid");
            else{req.user = user;
            console.log("good authenticate")
            next();}
        })}
    }
    else{
        console.log("hiiii dont inside authen")
        next()
    }    
}

module.exports = { athenticateToken}