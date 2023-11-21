let { getGuild, getAdmin } = require("../../Utils/Database");
let { embed } = require("../../Utils/Embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = async (Acuity, oldChannel, newChannel) => {
  let adminSettings = await getAdmin();
  if (adminSettings.isInMaintenance) return;

  let guild = await getGuild(newChannel.guild.id);

  if (newChannel.type === "DM") return;
  if (!guild) return;

  let logChannel = newChannel.guild.channels.cache.find(
    (c) => c.id === guild.settings.channels.botLogs
  );

  if (!logChannel) return;

  if (
    guild.addons.advancedLogs.channelUpdate === false ||
    !guild.addons.advancedLogs.channelUpdate
  ) {
    return;
  } else {
    if (oldChannel.name !== newChannel.name) {
      logChannel.send({
        embeds: [
          embed(`**Log - Channel Renamed**
                    Channel - ${newChannel} [\`${newChannel.id}\`]

                    New Name - **${newChannel.name}**
                    Old Name - **${oldChannel.name}**`),
        ],
      });
    }

    if (oldChannel.topic !== newChannel.topic) {
      if (!oldChannel.topic) {
        oldChannel.topic = "None";
      }
      if (!newChannel.topic) {
        newChannel.topic = "None";
      }
      if (
        channel.guild.members.me
          .permissionsIn(logChannel)
          .has(PermissionFlagsBits.SendMessages)
      )
        logChannel.send({
          embeds: [
            embed(`**Log - Channel Topic Changed**
                    Channel - ${newChannel} [\`${newChannel.id}\`]

                    New Topic - **${newChannel.topic}\`
                    Old Topic -  **${oldChannel.topic}\``),
          ],
        });
    }
  }
};
