let { version } = require("../config.json");

let userDB = require("../Models/user");
let guildUserDB = require("../Models/guildUser");
let guildDB = require("../Models/dashboard");
let adminDB = require("../Models/admin");

const { User } = require("discord.js");

async function newGuild(guildID) {
  let newGuild = await new guildDB({
    guildID: guildID,
    settings: {
      channels: {
        botLogs: "Not Set",
      },
    },
    addons: {
      memberCount: {
        enabled: false,
        botChannel: "Not Set",
        memberChannel: "Not Set",
        humanChannel: "Not Set",
        rolesChannel: "Not Set",
        textChannel: "Not Set",
        voiceChannel: "Not Set",
      },
      automod: {
        noSwear: false,
        noSpam: false,
        noLinks: false,
        noCaps: false,
        exempt: {
          roles: [],
          users: [],
          links: [],
          words: [],
        },
      },
      advancedLogs: {
        messageUpdate: false,
        emojiUpdate: false,
        banUpdate: false,
        memberUpdate: false,
        guildUpdate: false,
        roleUpdate: false,
        channelUpdate: false,
      },
      levels: {
        enabled: false,
        levelupMessage: "**[USER]** leveled up to level `[LEVEL]`!",
        rewards: [],
      },
      memberLogs: {
        enabled: false,
        joinRole: "Not Set",
        messages: {
          join: "Welcome **[USER]** to **[SERVER]**",
          leave: "**[USER]** just left the server :(",
        },
        channel: "Not Set",
      },
      security: {
        enabled: false,
        modules: {
          autoKick: {
            enabled: false,
            age: 259200000,
          },
          ageChecker: {
            enabled: false,
            age: 604800000,
          },
        },
      },
      lockdown: {
        isEnabled: false,
        messages: [],
        reason: "",
      },
    },
  });
  newGuild.save().catch((err) => console.log(err));
  return newGuild;
}
async function validateGuild(guild) {
  if (!guild.addons.memberCount) {
    var guild = guildDB.findOne(
      {
        guildID: guildID,
      },
      async (err, guildData) => {
        guildData.addons.memberCount = {
          enabled: false,
          botChannel: "",
          memberChannel: "",
          humanChannel: "",
          rolesChannel: "",
          textChannel: "",
          voiceChannel: "",
        };
        guildData.save().catch((err) => console.log(err));
      }
    );
    guild.addons.memberCount = {
      enabled: false,
      botChannel: "",
      memberChannel: "",
      humanChannel: "",
      rolesChannel: "",
      textChannel: "",
      voiceChannel: "",
    };
  }

  if (!guild.addons.automod) {
    var guild = guildDB.findOne(
      {
        guildID: guildID,
      },
      async (err, guildData) => {
        guildData.addons.automod = {
          noSwear: false,
          noSpam: false,
          noLinks: false,
          noCaps: false,
          exempt: {
            roles: [],
            users: [],
            links: [],
            words: [],
          },
        };
        guildData.save().catch((err) => console.log(err));
      }
    );

    guild.addons.automod = {
      noSwear: false,
      noSpam: false,
      noLinks: false,
      noCaps: false,
      exempt: {
        roles: [],
        users: [],
        links: [],
        words: [],
      },
    };
  }

  if (!guild.addons.advancedLogs) {
    var guild = guildDB.findOne(
      {
        guildID: guildID,
      },
      async (err, guildData) => {
        guildData.addons.advancedLogs = {
          messageUpdate: false,
          emojiUpdate: false,
          banUpdate: false,
          memberUpdate: false,
          guildUpdate: false,
          roleUpdate: false,
          channelUpdate: false,
        };
        guildData.save().catch((err) => console.log(err));
      }
    );
    guild.addons.advancedLogs = {
      messageUpdate: false,
      emojiUpdate: false,
      banUpdate: false,
      memberUpdate: false,
      guildUpdate: false,
      roleUpdate: false,
      channelUpdate: false,
    };
  }

  if (!guild.addons.levels) {
    var guild = guildDB.findOne(
      {
        guildID: guildID,
      },
      async (err, guildData) => {
        guildData.addons.levels = {
          enabled: false,
          levelupMessage: "**[USER]** just leveled up to level `[LEVEL]`!",
          rewards: [],
        };
        guildData.save().catch((err) => console.log(err));
      }
    );
    guild.addons.levels = {
      enabled: false,
      levelupMessage: "**[USER]** just leveled up to level `[LEVEL]`!",
      rewards: [],
    };
  }

  if (!guild.addons.memberLogs) {
    var guild = guildDB.findOne(
      {
        guildID: guildID,
      },
      async (err, guildData) => {
        guildData.addons.memberLogs = {
          enabled: false,
          joinRole: "Not Set",
          messages: {
            join: "Welcome **[USER]** to **[SERVER]**",
            leave: "**[USER]** just left the server :(",
          },
          channel: "Not set",
        };
        guildData.save().catch((err) => console.log(err));
      }
    );
    guild.addons.memberLogs = {
      enabled: false,
      joinRole: "Not Set",
      messages: {
        join: "Welcome **[USER]** to **[SERVER]**",
        leave: "**[USER]** just left the server :(",
      },
      channel: "Not set",
    };
  }

  if (!guild.addons.security) {
    var guild = guildDB.findOne(
      {
        guildID: guildID,
      },
      async (err, guildData) => {
        guildData.addons.security = {
          enabled: false,
          modules: {
            autoKick: {
              enabled: false,
              age: 259200000,
            },
            ageChecker: {
              enabled: false,
              age: 604800000,
            },
          },
        };
        guildData.save().catch((err) => console.log(err));
      }
    );
    guild.addons.security = {
      enabled: false,
      modules: {
        autoKick: {
          enabled: false,
          age: 259200000,
        },
        ageChecker: {
          enabled: false,
          age: 604800000,
        },
      },
    };
  }
  if (!guild.addons.lockdown) {
    var guild = guildDB.findOne(
      {
        guildID: guildID,
      },
      async (err, guildData) => {
        guildData.addons.lockdown = {
          isEnabled: false,
          messages: [],
          reason: "",
        };
        guildData.save().catch((err) => console.log(err));
      }
    );
    guild.addons.lockdown = {
      isEnabled: false,
      messages: [],
      reason: "",
    };
  }
}


module.exports.getGuild = async function getGuild(guildID) {
  var guild = await guildDB
    .findOne({
      guildID: guildID,
    })
    .exec();

  if (!guild) {
    guild = await newGuild(guildID);
  } else {
    await validateGuild(guild);
  }

  return await guild;
};

module.exports.getUser = async function getUser(userID) {
  var userFetch = await userDB
    .findOne({
      userID: userID,
    })
    .exec();

  if (!userFetch) {
    const newUser = new userDB({
      userID: userID,
      settings: {
        afk: {
          enabled: false,
          message: "No reason",
        },
        about: {
          bio: "This is the default bio, change it by using the command below!",
          country: "Somewhere in the world!",
        },
        badges: {
          botDev: false,
          botMod: false,
          verifiedPartner: false,
        },
        games: {
            steamID: ""
        }
      },
    });

    newUser.save().catch((err) => console.log(err));
    return newUser;
  } else {
    return userFetch;
  }
};

module.exports.getGuildUser = async function getGuildUser(userID, guildID) {
  var userFetch = await guildUserDB
    .findOne({
      userID: userID,
      guildID: guildID,
    })
    .exec();

  if (!userFetch) {
    const newUser = new guildUserDB({
      userID: userID,
      guildID: guildID,
      settings: {
        level: {
          level: 1,
          xp: 0,
        },
      },
    });

    newUser.save().catch((err) => console.log(err));
    return newUser;
  } else {
    return userFetch;
  }
};

module.exports.getAdmin = async function getAdmin() {
  var adminFetch = await adminDB.findOne({}).exec();

  if (!adminFetch) {
    const newAdmin = new adminDB({
      isInMaintenance: false,
      status: {
        message: `Acuity ${version}`,
        activity: 0,
        status: "ONLINE",
      },
    });

    newAdmin.save().catch((err) => console.log(err));
    return newAdmin;
  } else {
    return adminFetch;
  }
};
