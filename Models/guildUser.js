const mongoose = require("mongoose");

const dashboardSchema = mongoose.Schema({
    userID: String,
    guildID: String,
    settings: {
        level: {
            level: Number,
            xp: Number
        },
        economy: {
            money: Number,
            lastDaily: String
        }
    }
});

module.exports = mongoose.model("Guilduser", dashboardSchema);