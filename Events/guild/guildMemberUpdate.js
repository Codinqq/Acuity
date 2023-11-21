let { getGuild, getAdmin } = require("../../Utils/Database");
let { embed } = require("../../Utils/Embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = async (Acuity, oldMember, newMember) => {
  let adminSettings = await getAdmin();
  if (adminSettings.isInMaintenance) return;

  if (newMember.user.bot) return;

  let guild = await getGuild(newMember.guild.id);

  let logChannel = newMember.guild.channels.cache.find(
    (c) => c.id === guild.settings.channels.botLogs
  );

  if (
    guild.addons.advancedLogs.memberUpdate === false ||
    !guild.addons.advancedLogs.memberUpdate
  ) {
    return;
  } else {
    if (oldMember.roles != newMember.roles) {
      if (oldMember.roles.cache.size > newMember.roles.cache.size) {
        for (const role of oldMember.roles.cache.map((x) => x.id)) {
          if (!newMember.roles.cache.has(role)) {
            if (
              newMember.guild.members.me
                .permissionsIn(logChannel)
                .has(PermissionFlagsBits.SendMessages)
            )
              logChannel.send({
                embeds: [
                  embed(`**Log - Role Removed**
                        User - **${newMember.user.tag}** [\`${
                    newMember.user.id
                  }\`]
                        
                        Role Removed - ${newMember.guild.roles.cache.get(
                          role
                        )}`),
                ],
              });
          }
        }
      }
      if (oldMember.roles.cache.size < newMember.roles.cache.size) {
        for (const role of newMember.roles.cache.map((x) => x.id)) {
          if (!oldMember.roles.cache.has(role)) {
            if (
              newMember.guild.members.me
                .permissionsIn(logChannel)
                .has(PermissionFlagsBits.SendMessages)
            )
              logChannel.send({
                embeds: [
                  embed(`**Log - Role Added**
                                User - **${newMember.user.tag}** [\`${
                    newMember.user.id
                  }\`]
                                
                                Role Added - ${newMember.guild.roles.cache.get(
                                  role
                                )}`),
                ],
              });
          }
        }
      }
    }
    if (oldMember.displayName !== newMember.displayName) {
      if (
        newMember.guild.members.me
          .permissionsIn(logChannel)
          .has(PermissionFlagsBits.SendMessages)
      )
        logChannel.send({
          embeds: [
            embed(`**Log - Username Changed**
            User - **${newMember.user.tag}** [\`${newMember.user.id}\`]
            
            Old Name - **${oldMember.displayName}**
            New Name - **${newMember.displayName}**`),
          ],
        });
    }
  }
};
