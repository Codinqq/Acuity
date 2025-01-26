const { boolean } = require("mathjs");
const mongoose = require("mongoose");

const dashboardSchema = mongoose.Schema({
  guildID: String,
  settings: {
    channels: {
      botLogs: String,
    },
    blacklist: {
      blacklisted: Boolean,
      reason: String,
      blacklister: String,
    },
    prefix: String,
  },
  addons: {
    memberCount: {
      enabled: Boolean,
      botChannel: String,
      memberChannel: String,
      humanChannel: String,
      rolesChannel: String,
      textChannel: String,
      voiceChannel: String,
    },
    automod: {
      noSwear: Boolean,
      noSpam: Boolean,
      noLinks: Boolean,
      noCaps: Boolean,
      exempt: {
        roles: [String],
        users: [String],
        links: [String],
        words: [String],
      },
    },
    advancedLogs: {
      messageUpdate: Boolean,
      emojiUpdate: Boolean,
      banUpdate: Boolean,
      memberUpdate: Boolean,
      guildUpdate: Boolean,
      roleUpdate: Boolean,
      channelUpdate: Boolean,
    },
    levels: {
      enabled: Boolean,
      levelupMessage: String,
      rewards: Array,
    },
    memberLogs: {
      enabled: Boolean,
      joinRole: String,
      messages: {
        join: String,
        leave: String,
      },
      channel: String,
    },
    security: {
      enabled: Boolean,
      modules: {
        autoKick: {
          enabled: Boolean,
          age: Number,
        },
        ageChecker: {
          enabled: Boolean,
          age: Number,
        },
      },
    },
    lockdown: {
      isEnabled: Boolean,
      message: {channelID: String, messageID: String},
      reason: String
    }
  },
});

module.exports = mongoose.model("Dashboard", dashboardSchema);
