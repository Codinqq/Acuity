let { getGuild, getAdmin } = require("../../Utils/Database");
let { embed } = require("../../Utils/Embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = async (Acuity, oldMessage, newMessage) => {
  let adminSettings = await getAdmin();
  if (adminSettings.isInMaintenance) return;

  if (newMessage.partial) {
    return;
  }

  if (newMessage.author.bot) return;
  if (newMessage.channel.type === "DM") return;
  if (
    Acuity.noLogs.get(`${newMessage.guild.id}.${newMessage.author.id}`) === true
  )
    return;

  let guild = await getGuild(newMessage.guild.id);

  if (!guild) return;

  let logChannel = newMessage.channel.guild.channels.cache.find(
    (c) => c.id === guild.settings.channels.botLogs
  );

  if (!logChannel) return;

  if (
    guild.addons.advancedLogs.messageUpdate === false ||
    !guild.addons.advancedLogs.messageUpdate
  ) {
    return;
  } else {
    if (oldMessage.cleanContent === null) return;

    if (oldMessage.cleanContent === newMessage.cleanContent) return;

    if (newMessage.author.bot) return;

    if (newMessage.cleanContent.length > 800) {
      newMessage.cleanContent = newMessage.cleanContent.substr(0, 799) + "...";
    }
    if (oldMessage.cleanContent.length > 800) {
      oldMessage.cleanContent = oldMessage.cleanContent.substr(0, 799) + "...";
    }

    if (
      newMessage.cleanContent.length === 0 &&
      oldMessage.cleanContent.length === 0
    )
      return;

    if (
      newMessage.guild.members.me
        .permissionsIn(logChannel)
        .has(PermissionFlagsBits.SendMessages)
    )
      logChannel.send({
        embeds: [
          embed(`**Log - Message Update**
            Author - **${newMessage.author.tag}** [\`${newMessage.author.id}\`]
            Channel - ${newMessage.channel} [\`${newMessage.channel.id}\`]
            
            Old Message\n${oldMessage.cleanContent}
            
            New Message\n${newMessage.cleanContent}`),
        ],
      });
  }
};
