const mongoose = require('mongoose');
const { NeighborCountrySchema, UserSchema, TeamSchema, GameSchema, questionSchema, DeletedGamesSchema } = require("./models");


mongoose.connect('mongodb+srv://uri:dan@cluster0.lku9ksw.mongodb.net/?retryWrites=true&w=majority');

const db = mongoose.connection;


const insertNeighborCountries = async () => {
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
            return false
        } else {
            console.log(`${result.insertedCount} documents inserted`);
            return true
        }
    });
}

module.exports = { insertNeighborCountries }

