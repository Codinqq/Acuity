let { getGuild, getAdmin } = require("../../Utils/Database");
let { embed } = require("../../Utils/Embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = async (Acuity, message) => {
  let adminSettings = await getAdmin();
  if (adminSettings.isInMaintenance) return;

  if (message.channel.type === "DM") return;

  let guild = await getGuild(message.guild.id);
  if (message.partial) {
    return;
  }

  if (message.author.bot) return;
  if (Acuity.noLogs.get(`${message.guild.id}.${message.author.id}`) === true)
    return;

  if (!guild) return;

  let logChannel = message.channel.guild.channels.cache.find(
    (c) => c.id === guild.settings.channels.botLogs
  );

  if (!logChannel) return;

  if(message.content.length >= 0) {
    return;
  }

  if (guild.addons.advancedLogs.messageUpdate === true) {
    if (message.content.length > 1500) {
      message.content = message.content.substr(0, 1499) + "...";
    }

    if (message.content.startsWith(guild.settings.prefix)) return;

    if (message.author.bot) return;
    if (message.system) return;

    if (message.length <= 0) return;

    if (
      message.guild.members.me
        .permissionsIn(logChannel)
        .has(PermissionFlagsBits.SendMessages)
    )
      return logChannel.send({
        embeds: [
          embed(`**Log - Message Removed**
                Author - **${message.author.tag}** [\`${message.author.id}\`]
                Channel - ${message.channel} [\`${message.channel.id}\`]
                
                Message - **${message.content}**`),
        ],
      });
  }
};
