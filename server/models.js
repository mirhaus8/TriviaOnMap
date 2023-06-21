const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://uri:dan@cluster0.lku9ksw.mongodb.net/?retryWrites=true&w=majority');

const GameQuestionSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    difficulty: {
        type: String,
        required: false
    },
    class: {
        type: String,
        required: false
    }
});

const AnswerSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true
    },
    team:{
        type: String,
        required: true
    },
    questionPath:{
        type: String,
        required: true
    }
})

const DeletedGamesSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    name:{
        type: String,
        default: ""
    },
    users:{
        type:[],
        default:[]
    },
})

const TeamSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    color:{
        type: String,
        default: ""
    },
    points:{
        type:Number,
        default:0
    },
    name: {
        type: String,
        required: true
    },
    originCountry: {
        type: String,
        required: false,
        default: ""
    },
    numOfMistakes: {
        type: Number,
        default: 0
    },
    usedQuestions: {
        type: [],
        default: []
    },
    errors:{
        type: [AnswerSchema],
        default: []
    },
    users: {
        type: [],
        default: []
    },
    level:{
        type: String,
        required: false,
        default: ""
    },
    subject:{
        type: String,
        required: false,
        default: ""
    },
    grade:{
        type: String,
        required: false,
        default: ""
    },
    occupiedCountries: {
        type: [{
            _id: mongoose.Types.ObjectId,
            country: String
        }],
        default: []
    },
    potentialCountries: {
        type: [],
        default: []
    },
    lost: {
        type: Boolean,
        default: false
    },

    teamMembersEntered:{
        type: [],
        default: []
    }
});





const GameSchema = new mongoose.Schema({
    gameName: {
        type: String,
        required: true
    },
    ended: {
        type: Boolean,
        default: false
    },
    started: {
        type: Boolean,
        default: false
    },
    answers:{
        type: [AnswerSchema],
        default: []
    },
    
    teacher:{
        type: String,
        required: false
    },
    startDate: {
        type: Date,
        default: Date.now()
    },
    occupiedCountries: {
        type: [],
        default: []
    },
    teams: {
        type: [TeamSchema],
        default: []
    },
    questions: {
        type: [GameQuestionSchema],
        default: []
    },
    losers:{
        type: [],
        default: []
    },
    timeLimit:{
        type: Number,
        default:30 
    }
});


const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role:{
        type: String,
        required: true
    },
    friends: {
        type: [],
        default: []
    },
    school:{
        type: String,
        required: false
    },
    grade:{
        type: String,
        required: false
    }
});

const NeighborCountrySchema = new mongoose.Schema({
    _id: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    color:{
        type: String,
        required: true
    },
    neighbor_countries: [{
        _id: mongoose.Types.ObjectId,
        country: String
    }]
});


const questionSchema = {
    path: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        required: true
    },
    subjet: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    class: {
        type: String,
        required: false
    },
    owner: {
        type: String,
        required: false
    },
    name: {
        type: String,
        required: false
    },
    tags:{
        type: [],
        default: []
    }
};

const refreshTokenSchema = new mongoose.Schema({
    token:String,
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },

});

const geojsonSchema = new mongoose.Schema({
    type: String,
    properties: {
          ADMIN: String,
          ISO_A3: String
    },
    geometry: {
          type: { type: String },
          coordinates: []
    }
      
    
  });

module.exports = { geojsonSchema, NeighborCountrySchema, UserSchema, TeamSchema, GameSchema, questionSchema,refreshTokenSchema, DeletedGamesSchema }

