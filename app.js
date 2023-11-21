const {
  Client,
  Collection,
  GatewayIntentBits,
} = require("discord.js");
const Acuity = new Client({
  allowedMentions: {
    parse: ["users", "roles", "everyone"],
    repliedUser: true,
  },
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent,
  ],
});

const { Manager } = require("erela.js");


module.exports.Acuity = Acuity;

// Utilities
const {
  token,
  betaToken,
  mongoose,
  inDevelopment,
  erelaEnabled
} = require("./config.json");

// Connect to the database.
const Mongoose = require("mongoose");
Mongoose.connect(mongoose, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

if (erelaEnabled) {
  Acuity.manager = new Manager({
    nodes: [
      {
        host: "0.0.0.0",
        port: 2333,
        password: "Acuity",
      },
    ],
    send(id, payload) {
      const guild = Acuity.guilds.cache.get(id);
      if (guild) guild.shard.send(payload);
    },
  });
  require(`./Handlers/erela`)(Acuity, Acuity.manager);
}

["commands", "aliases", "xpTimeout", "antiSpam", "noLogs"].forEach((x) => {
  Acuity[x] = new Collection();
});
["commands", "events"].forEach((x) => require(`./Handlers/${x}`)(Acuity));


Acuity.login((inDevelopment ? betaToken : token));
