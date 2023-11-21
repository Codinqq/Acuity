const mongoose = require("mongoose");

const notiSchema = mongoose.Schema({
    latest: String,
    webhook: String,
    type: String,
    channel: String,
    guildID: String,
    roleToMention: String,
    streaming: {
        isStreaming: Boolean,
        removeWhenDone: Boolean,
        messageID: String,
    },
});

module.exports = mongoose.model("Notifications", notiSchema);