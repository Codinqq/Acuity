let { getGuild, getAdmin, getGuildUser } = require("../../Utils/Database");
let { embed } = require("../../Utils/Embeds");
let prettyMS = require("pretty-ms");
const { PermissionFlagsBits } = require("discord.js");

module.exports = async (Acuity, member) => {
  let adminSettings = await getAdmin();
  if (adminSettings.isInMaintenance) return;

  let guild = await getGuild(member.guild.id);
  let user = await getGuildUser(member.user.id, member.guild.id);
  if (!guild) return;

  let logChannel = member.guild.channels.cache.find(
    (c) => c.id === guild.settings.channels.botLogs
  );

  if (guild.addons.lockdown.isEnabled) {
    return member
      .send({
        embeds: [
          embed(`**Lockdown!**
          \`${member.guild.name}\` is currently in lockdown, please join again at a later date.\n
          > Reason: \`${guild.addons.lockdown.reason}\``),
        ],
      })
      .then((msg) => {
        if (
          member.guild.members.me.permissions.has(
            PermissionFlagsBits.KickMembers
          )
        ) {
          return member.kick();
        } else if (
          member.guild.members.me.permissions.has(
            PermissionFlagsBits.ManageRoles
          )
        ) {
          let lockdownRole = member.guild.roles.cache.find(
            (r) => r.name === "Lockdown"
          );
          if (lockdownRole) member.roles.add(lockdownRole);
        }
      })
      .catch((err) => {
        if (
          member.guild.members.me.permissions.has(
            PermissionFlagsBits.KickMembers
          )
        ) {
          return member.kick();
        } else if (
          member.guild.members.me.permissions.has(
            PermissionFlagsBits.ManageRoles
          )
        ) {
          let lockdownRole = member.guild.roles.cache.find(
            (r) => r.name === "Lockdown"
          );
          if (lockdownRole) member.roles.add(lockdownRole);
        }
      });
  }

  if (guild.addons.security.enabled) {
    if (guild.addons.security.modules.ageChecker.enabled) {
      if (guild.addons.security.modules.autoKick.enabled) {
        if (
          Date.now() - member.user.createdTimestamp <
          guild.addons.security.modules.autoKick.age
        ) {
          if (
            member.guild.members.me
              .permissionsIn(logChannel)
              .has(PermissionFlagsBits.SendMessages)
          )
            logChannel.send({
              embeds: [
                embed(`**Attention!**
                    I kicked a user that joined the server, because they created their account in the last ${prettyMS(
                      guild.addons.security.modules.autoKick.age
                    )}.

                    User kicked - **${
                      member.user.username + "#" + member.user.discriminator
                    }** [\`${member.id}\`]
                    User created - **${prettyMS(
                      member.user.createdTimestamp
                    )}**`),
              ],
            });
          member.kick();
        } else if (
          Date.now() - member.user.createdTimestamp <
          guild.addons.security.modules.ageChecker.age
        ) {
          if (logChannel) {
            if (
              member.guild.members.me
                .permissionsIn(logChannel)
                .has(PermissionFlagsBits.SendMessages)
            )
              logChannel.send({
                embeds: [
                  embed(`**Attention!**
                      There was a user that joined the server, which has been created in the last ${prettyMS(
                        guild.addons.security.modules.ageChecker.age
                      )}.

                      User joined - **${
                        member.user.username + "#" + member.user.discriminator
                      }** [\`${member.id}\`]
                      User created - **${prettyMS(
                        member.user.createdTimestamp
                      )}**
                    `),
                ],
              });
          }
        }
      } else {
        if (
          Date.now() - member.user.createdTimestamp <
          guild.addons.security.modules.ageChecker.age
        ) {
          if (logChannel) {
            if (
              member.guild.members.me
                .permissionsIn(logChannel)
                .has(PermissionFlagsBits.SendMessages)
            )
              logChannel.send({
                embeds: [
                  embed(`**Attention!**
                    There was a user that joined the server, which has been created in the last ${prettyMS(
                      guild.addons.security.modules.ageChecker.age
                    )}.

                    User joined - **${
                      member.user.username + "#" + member.user.discriminator
                    }** [\`${member.id}\`]
                    User created - **${prettyMS(member.user.createdTimestamp)}**
                    `),
                ],
              });
          }
        }
      }
    }
  }

  if (guild.addons.memberLogs.enabled === false) return;

  let role = member.guild.roles.cache.find(
    (c) => c.id === guild.addons.memberLogs.joinRole
  );
  let joinChannel = member.guild.channels.cache.find(
    (c) => c.id === guild.addons.memberLogs.channel
  );

  let joinMessage = guild.addons.memberLogs.messages.join;

  joinMessage = joinMessage
    .replaceAll(
      "[USER]",
      member.user.username + "#" + member.user.discriminator
    )
    .replaceAll("[COUNT]", member.guild.memberCount)
    .replaceAll("[SERVER]", member.guild.name);

  if (role)
    member.roles.add(role, {
      reason: `Acuity - Role added on join`,
    });
  if (joinChannel) {
    if (
      member.guild.members.me
        .permissionsIn(joinChannel)
        .has(PermissionFlagsBits.SendMessages)
    )
      joinChannel.send({ embeds: [embed(`${joinMessage}`)] });
  }

  if (!logChannel) return;
  if (logChannel) {
    if (
      member.guild.members.me
        .permissionsIn(logChannel)
        .has(PermissionFlagsBits.SendMessages)
    )
      logChannel.send({
        embeds: [
          embed(`**Log - Member Join**
                ${
                  member.user.username + "#" + member.user.discriminator
                } joined the server!`),
        ],
      });
  }
};
