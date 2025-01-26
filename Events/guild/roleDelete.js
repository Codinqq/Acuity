let { getGuild, getAdmin } = require("../../Utils/Database");
let { embed } = require("../../Utils/Embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = async (Acuity, role) => {
  let adminSettings = await getAdmin();
  if (adminSettings.isInMaintenance) return;

  let guild = await getGuild(role.guild.id);

  if (!guild) return;

  let logChannel = role.guild.channels.cache.find(
    (c) => c.id === guild.settings.channels.botLogs
  );

  if (!logChannel) return;

  if (
    guild.addons.advancedLogs.roleUpdate === false ||
    !guild.addons.advancedLogs.roleUpdate
  ) {
    return;
  } else {
    if (
      guild.addons.advancedLogs.roleUpdate === false ||
      !guild.addons.advancedLogs.roleUpdate
    )
      return;
    if (
      role.guild.members.me
        .permissionsIn(logChannel)
        .has(PermissionFlagsBits.SendMessages)
    )
      logChannel.send({
        embeds: [
          embed(`**Log - Role Removed**
                Role - ${role.name} [\`${role.id}\`]`).setColor(role.color),
        ],
      });
  }
};
