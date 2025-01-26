let { getUser } = require("../../Utils/Database");
let { embed } = require("../../Utils/Embeds");const moment = require("moment");
const { steamToken } = require("../../config.json");
const {
  SlashCommandBuilder,
} = require("discord.js");
const fetch = require("node-fetch");
const lookup = require("country-code-lookup");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("steam")
    .setDescription("Get information about a Steam user!")
    .setDMPermission(false)
    .addStringOption((options) =>
      options
        .setName("searchuser")
        .setRequired(true)
        .setDescription(
          "The user you want to search for. Either Tag them, get the ID or their Steam VanityURL"
        )
    ),
  execute: async (Acuity, interaction) => {
    let steamUser = interaction.options.getString("searchuser");

    await interaction.deferReply();

    if (steamUser.includes("<@")) {
      steamUser = steamUser.replace("<@", "").replace(">", "");
    }

    if (interaction.guild.members.cache.find((c) => c.id === steamUser)) {
      let userDB = await getUser(steamUser);

      if (
        userDB.settings.games.steamID !== "" ||
        userDB.settings.games.steamID !== null
      ) {
        steamUser = userDB.settings.games.steamID;
      }
    }

    if (isNaN(steamUser)) {
      const body = await fetch(
        `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${steamToken}&vanityurl=${steamUser}`
      );
      const userinfo = await body.json();

      if (userinfo.response.steamid) {
        steamUser = userinfo.response.steamid;
      } else {
        return interaction
          .editReply({
            embeds: [
              embed(`**Steam**
                            I couldn't find that user on Steam!`),
            ],
          })
          .then((m) => {
            setTimeout(() => {
              m.delete();
            }, 3000);
          });
      }
    }

    const body = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${steamToken}&format=json&steamids=${steamUser}`
    );
    let userinfo = await body.json();
    userinfo = userinfo.response.players[0];

    const gamesBody = await fetch(
      `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=${steamToken}&format=json&steamid=${steamUser}&count=5`
    );
    let games = await gamesBody.json();
    let recentlyPlayed = "";

    if (games.response.games) {
      games = games.response.games.reverse();
      for (var i in games) {
        recentlyPlayed += `**${games[i].name}** - **${(
          games[i].playtime_forever / 60
        ).toFixed(1)}** hours total\n`;
      }
    }

    const levelBody = await fetch(
      `https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=${steamToken}&format=json&steamid=${steamUser}`
    );
    let level = await levelBody.json();
    level = level.response.player_level;

    let createdAt = moment
      .unix(userinfo.timecreated)
      .utc()
      .format("MM/DD/YYYY - HH:MM UTC");
    let loggedOff = moment
      .unix(userinfo.lastlogoff)
      .utc()
      .format("MM/DD/YYYY - HH:MM UTC");

    if (loggedOff === "Invalid date") loggedOff = "Not Known";
    if (createdAt === "Invalid date") createdAt = "Not Known";

    await interaction.editReply({
      embeds: [
        embed(`**Steam**
                        User - **${userinfo.personaname}** [**${
          userinfo.steamid
        }**]
                        Country - **${
                          lookup.byIso(userinfo.loccountrycode).country
                        }**
                        Level - **${level}**

                        Created at - **${createdAt}**
                        Last logged off - **${loggedOff}**

                        ${recentlyPlayed}
                
                        `).setThumbnail(userinfo.avatarfull),
      ],
    });
  },
};
