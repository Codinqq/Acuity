const mongoose = require("mongoose");

const dashboardSchema = mongoose.Schema({
    guildID: String,
    messageID: String,
    channelID: String,
    customEmoji: Boolean,
    reactionID: String,
    roleID: String
});

module.exports = mongoose.model("Rolereactions", dashboardSchema);