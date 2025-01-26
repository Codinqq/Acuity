let { getGuild } = require("../../Utils/Database");
let { embed, noPerms, logs, user } = require("../../Utils/Embeds");
const { mainColor } = require("../../config.json");
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Mute a user!")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Specify the user of the user you want to mute")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Specify the reason of the mute")
        .setRequired(true)
    )
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  execute: async (Acuity, interaction) => {
    let guild = await getGuild(interaction.guild.id);

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles))
      return interaction
        .reply({ embeds: [noPerms("Manage Messages")] })
        .then((m) =>
          interaction.fetchReply().then((m) => {
            setTimeout(() => {
              m.delete();
            }, 3000);
          })
        );

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction
        .reply({
          embeds: [
            embed(`**Mute**
            I do not have access to manage roles.
            
            Please let me be able to manage a roles before trying again`),
          ],
        })
        .then((m) =>
          interaction.fetchReply().then((m) => {
            setTimeout(() => {
              m.delete();
            }, 3000);
          })
        );
    }

    let reason = interaction.options._hoistedOptions.find(
      (c) => c.name === "reason"
    ).value;

    let userMember = interaction.options.getMember("user");
    if (userMember.permissions.has(PermissionFlagsBits.ManageMessages))
      return interaction
        .reply({
          embeds: [
            embedembed(`**Mute**                                
                You can't mute a user with the \`Manage Messages\` permission.`),
          ],
        })
        .then((m) =>
          interaction.fetchReply().then((m) => {
            setTimeout(() => {
              m.delete();
            }, 3000);
          })
        );
    if (userMember.id === interaction.user.id)
      return interaction
        .reply({
          embeds: [
            embedembed(`**Mute**                                
             You can't mute yourself.`),
          ],
        })
        .then((m) =>
          interaction.fetchReply().then((m) => {
            setTimeout(() => {
              m.delete();
            }, 3000);
          })
        );

    let logChannel = interaction.guild.channels.cache.find(
      (c) => c.id === guild.settings.channels.botLogs
    );
    let muteRole = interaction.guild.roles.cache.find(
      (c) => c.name === "Muted"
    );

    if (!muteRole) {
      console.log("no role")
      muteRole = interaction.guild.roles
        .create({
          name: "Muted",
          color: mainColor,
          position: 0,
          reason: "Acuity - No muterole found.",
        })
        .then(async (role) => {
          await interaction.guild.channels.cache.forEach(
            async (channel, id) => {
              await channel.permissionOverwrites.create(role, {
                SendMessages: false,
                AddReactions: false
              });
            }
          );
          if (!logChannel) {
            await userMember
              .send({
                embeds: [
                  user("Mute", interaction.user, interaction.guild, reason),
                ],
              })
              .catch(() => {
                interaction.channel.send({
                  embeds: [
                    embed(`**Mute** 
                                I couldn't send a message to this user, as they don't have direct-messages enabled.`),
                  ],
                });
              })
              .then((m) =>
                interaction.fetchReply().then((m) => {
                  setTimeout(() => {
                    m.delete();
                  }, 3000);
                })
              );
            await userMember.roles.add(role);
          } else {
            await userMember
              .send({
                embeds: [user("Mute", message.user, interaction.guild, reason)],
              })
              .catch(() => {
                interaction.channel.send({
                  embeds: [
                    embed(`**Mute** 
                                I couldn't send a message to this user, as they don't have direct-messages enabled.`),
                  ],
                });
              })
              .then((m) =>
                interaction.fetchReply().then((m) => {
                  setTimeout(() => {
                    m.delete();
                  }, 3000);
                })
              );
            await logChannel.send({
              embeds: [
                logs(
                  "Mute",
                  userMember.user,
                  interaction.user,
                  interaction.channel,
                  reason
                ),
              ],
            });
            await userMember.roles.add(role);

            return interaction
              .reply({
                embeds: [
                  embed(`**Mute**                                
                            ${
                              userMember.user.username +
                              "#" +
                              userMember.user.discriminator
                            } has been muted by ${
                    interaction.user.username +
                    "#" +
                    interaction.user.discriminator
                  }`),
                ],
              })
              .then((m) =>
                interaction.fetchReply().then((m) => {
                  setTimeout(() => {
                    m.delete();
                  }, 3000);
                })
              );
          }
        });
    } else {
      if (!logChannel) {
        await userMember
          .send({
            embeds: [user("Mute", interaction.user, interaction.guild, reason)],
          })
          .catch(() => {
            message.channel.send({
              embeds: [
                embed(`**Mute** 
                            I couldn't send a message to this user, as they don't have direct-messages enabled.`),
              ],
            });
          });
        await userMember.roles.add(muteRole);
      } else {
        await userMember
          .send({
            embeds: [user("Mute", interaction.user, interaction.guild, reason)],
          })
          .catch(() => {
            message.channel.send({
              embeds: [
                embed(`**Mute** 
                            I couldn't send a message to this user, as they don't have direct-messages enabled.`),
              ],
            });
          });
        await logChannel.send({
          embeds: [
            logs(
              "Mute",
              userMember.user,
              interaction.user,
              interaction.channel,
              reason
            ),
          ],
        });
        await userMember.roles.add(muteRole);
      }
      return interaction
        .reply({
          embeds: [
            embed(`**Mute**                                
                                ${
                                  userMember.user.username +
                                  "#" +
                                  userMember.user.discriminator
                                } has been muted by ${
              interaction.user.username + "#" + interaction.user.discriminator
            }`),
          ],
        })
        .then((m) =>
          interaction.fetchReply().then((m) => {
            setTimeout(() => {
              m.delete();
            }, 3000);
          })
        );
    }
  },
};
