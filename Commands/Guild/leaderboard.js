let { getGuild } = require("../../Utils/Database");
let { embed } = require("../../Utils/Embeds");
const gUsers = require("../../Models/guildUser");
const {
  SlashCommandBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Find out who's top 10 on the leaderboard!")
    .setDMPermission(false),
  execute: async (Acuity, interaction) => {
    let guild = await getGuild(interaction.guild.id);

    if (guild.addons.levels.enabled === false) {
      return interaction
        .reply({
          embeds: [
            embed(`**Leaderboard**
                The guild doesn't have the Level-Module enabled!`),
          ],
        })
        .then((m) =>
          interaction.fetchReply().then((m) => {
            setTimeout(() => {
              m.delete();
            }, 3000);
          })
        );
    } else {
      gUsers
        .find({
          guildID: interaction.guild.id,
        })
        .sort([["settings.level.xp", "descending"]])
        .exec((err, res) => {
          let embedRes = "";
          let leaderboardRes = "";
          if (res.length === 0) {
            return interaction
              .reply({
                embeds: [
                  embed(`**Leaderboard**
                    We didn't find any users with experience.`),
                ],
              })
              .then((m) =>
                interaction.fetchReply().then((m) => {
                  setTimeout(() => {
                    m.delete();
                  }, 3000);
                })
              );
          } else if (res.length < 10) {
            for (i = 0; i < res.length; i++) {
              let user = Acuity.users.cache.get(res[i].userID);
              if (res[i].userID === interaction.user.id) {
                leaderboardRes += `\`${
                  interaction.user.tag
                }\` is currently on the **${
                  i + 1
                }. place** on the leaderboard.\n`;
                leaderboardRes += `Levels **${res[i].settings.level.level}** - Exp **${res[i].settings.level.xp}**`;
              }
              var username;
              if (!user) {
                username = "User has left the server";
              } else {
                username = user.username + "#" + user.discriminator;
              }
              embedRes += `**#${i + 1}** - ${username}\n- Level **${
                res[i].settings.level.level
              }** - Exp **${res[i].settings.level.xp}** \n`;
            }
          } else {
            for (i = 0; i < 10; i++) {
              let user = Acuity.users.cache.get(res[i].userID);
              var username;
              if (!user) {
                username = "User has left the server";
              } else {
                username = user.username + "#" + user.discriminator;
              }
              embedRes += `**#${i + 1}** - ${username}\n- Level **${
                res[i].settings.level.level
              }** - Exp **${res[i].settings.level.xp}** \n`;
              if (res[i].userID === interaction.user.id) {
                leaderboardRes += `\`${
                  interaction.user.tag
                }\` is currently on the **${
                  i + 1
                }. place** on the leaderboard.\n`;
                leaderboardRes += `Levels **${res[i].settings.level.level}** - Exp **${res[i].settings.level.xp}**`;
              }
            }
          }
          return interaction.reply({
            embeds: [
              embed(`**Leaderboard**
                \n${embedRes}
                ${leaderboardRes}`),
            ],
          });
        });
    }
  },
};
