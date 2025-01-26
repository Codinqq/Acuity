let { getGuild, getAdmin } = require("../../Utils/Database");
let { embed } = require("../../Utils/Embeds");
const { PermissionFlagsBits, ChannelType } = require("discord.js");

module.exports = async (Acuity, channel) => {
  let adminSettings = await getAdmin();
  if (adminSettings.isInMaintenance) return;

  let guild = await getGuild(channel.guild.id);

  if (channel.type === "DM") return;
  if (!guild) return;

  let logChannel = channel.guild.channels.cache.find(
    (c) => c.id === guild.settings.channels.botLogs
  );

  if (!logChannel) return;

  if (
    guild.addons.advancedLogs.channelUpdate === false ||
    !guild.addons.advancedLogs.channelUpdate
  )
    return;

  let type = "";
  if (
    channel.guild.members.me
      .permissionsIn(logChannel)
      .has(PermissionFlagsBits.SendMessages)
  )

  if(channel.type === ChannelType.GuildAnnouncement) type = "Announcement";
  if(channel.type === ChannelType.GuildCategory) type = "Category";
  if(channel.type === ChannelType.GuildForum) type = "Forum";
  if(channel.type === ChannelType.GuildDirectory) type = "Directory";
  if(channel.type === ChannelType.GuildStageVoice) type = "Stage";
  if(channel.type === ChannelType.GuildText) type = "Text";
  if(channel.type === ChannelType.GuildVoice) type = "Voice";

    logChannel.send({
      embeds: [
        embed(`**Log - Channel Removed**
        Channel - **${channel.name}** [\`${channel.id}\`]
        Type - **${type}**`),
      ],
    });
};
