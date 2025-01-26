const mongoose = require("mongoose");

const dashboardSchema = mongoose.Schema({
    guildID: String,
    name: String,
    questions: Array
});

module.exports = mongoose.model("Applications", dashboardSchema);