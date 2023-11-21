let { getGuild, getAdmin } = require("../../Utils/Database");
let { embed } = require("../../Utils/Embeds");
const { PermissionFlagsBits } = require("discord.js");


module.exports = async (Acuity, oldRole, newRole) => {
  let adminSettings = await getAdmin();
  if (adminSettings.isInMaintenance) return;

  let guild = await getGuild(newRole.guild.id);

  if (!guild) return;

  let logChannel = newRole.guild.channels.cache.find(
    (c) => c.id === guild.settings.channels.botLogs
  );

  if (!logChannel) return;

  if (
    guild.addons.advancedLogs.roleUpdate === false ||
    !guild.addons.advancedLogs.roleUpdate
  ) {
    return;
  } else {
    if (newRole.hexColor != oldRole.hexColor) {
      if (
        newRole.guild.members.me
          .permissionsIn(logChannel)
          .has(PermissionFlagsBits.SendMessages)
      )
        logChannel.send({
          embeds: [
            embed(`**Log - Role Recolored**
                    Role - ${newRole} [\`${newRole.id}\`]
        
                    Old Color - **${oldRole.hexColor}**
                    New Color - **${newRole.hexColor}**`).setColor(
              newRole.color
            ),
          ],
        });
    }

    if (newRole.name != oldRole.name) {
      if (
        newRole.guild.members.me.permissionsIn(logChannel).has(PermissionFlagsBits.SendMessages)
      )
        logChannel.send({
          embeds: [
            embed(`**Log - Role Renamed**
                    Role - ${newRole.name} [\`${newRole.id}\`]
        
                    Old Name - **${oldRole.name}**
                    New Name - **${newRole.name}**`),
          ],
        });
    }

    if (newRole.hoist != oldRole.hoist) {
      if (
        newRole.guild.members.me.permissionsIn(logChannel).has(PermissionFlagsBits.SendMessages)
      )
        logChannel.send({
          embeds: [
            embed(`**Log - Role Hoistable**
                    Role - ${newRole.name} [\`${newRole.id}\`]

                    The role is now ${
                      newRole.hoist ? "Hoisted" : "Unhoisted"
                    }`),
          ],
        });
    }

    if (newRole.mentionable != oldRole.mentionable) {
      if (
        newRole.guild.members.me.permissionsIn(logChannel).has(PermissionFlagsBits.SendMessages)
      )
        logChannel.send({
          embeds: [
            embed(`**Log - Role Mentionable**
                    Role - ${newRole.name} [\`${newRole.id}\`]
        
                    The role is now ${
                      newRole.mentionable ? "Mentionable" : "Not Mentionable"
                    }`),
          ],
        });
    }

    if (newRole.position != oldRole.position) {
      if (
        newRole.guild.members.me.permissionsIn(logChannel).has(PermissionFlagsBits.SendMessages)
      )
        logChannel.send({
          embeds: [
            embed(`**Log - Role Repositioned**
                    Role - ${newRole.name} [\`${newRole.id}\`]

                    New Position - **${newRole.position}**
                    Old Position - **${oldRole.position}**`),
          ],
        });
    }
  }
};
