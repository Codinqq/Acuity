const mongoose = require("mongoose");

const dashboardSchema = mongoose.Schema({
    userID: String,
    settings: {
        afk: {
            enabled: Boolean,
            message: String
        },
        about: {
            bio: String,
            country: String,
        },
        badges: {
            botDev: Boolean,
            botMod: Boolean,
            verifiedPartner: Boolean
        },
        games: {
            steamID: String,
        },
    }
});

module.exports = mongoose.model("User", dashboardSchema);