const gUsers = require("../../Models/guildUser");
let { getGuild, getAdmin } = require("../../Utils/Database");
let { embed } = require("../../Utils/Embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = async (Acuity, member) => {
  let adminSettings = await getAdmin();
  if (adminSettings.isInMaintenance) return;

  let guild = await getGuild(member.guild.id);
  if (!guild) return;

  gUsers.findOneAndDelete(
    {
      guildID: member.guild.id,
      userID: member.id,
    },
    async (err, user) => {
      if (err) console.log(err);
    }
  );

  if (guild.addons.memberLogs.enabled === false) return;

  let leaveMessage = guild.addons.memberLogs.messages.leave;

  leaveMessage = leaveMessage
    .replaceAll(
      "[USER]",
      member.user.username + "#" + member.user.discriminator
    )
    .replaceAll("[COUNT]", member.guild.memberCount)
    .replaceAll("[SERVER]", member.guild.name);

  let leaveChannel = member.guild.channels.cache.find(
    (c) => c.id === guild.addons.memberLogs.channel
  );
  if (leaveChannel) {
    if (
      member.guild.members.me
        .permissionsIn(leaveChannel)
        .has(PermissionFlagsBits.SendMessages)
    )
      leaveChannel.send({ embeds: [embed(`${leaveMessage}`)] });
  }
  let logChannel = member.guild.channels.cache.find(
    (c) => c.id === guild.settings.channels.botLogs
  );

  if (!logChannel) return;
  if (logChannel) {
    if (
      member.guild.members.me
        .permissionsIn(logChannel)
        .has(PermissionFlagsBits.SendMessages)
    )
      logChannel.send({
        embeds: [
          embed(`**Log - Member Leave**
                ${
                  member.user.username + "#" + member.user.discriminator
                } left the server!`),
        ],
      });
  }
};
