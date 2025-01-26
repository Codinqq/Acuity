let { getAdmin } = require("../../Utils/Database");
let { embed } = require("../../Utils/Embeds");
const reactionRoles = require("../../Models/reactionRoles");
const { PermissionFlagsBits } = require("discord.js");

module.exports = async (Acuity, messageReaction, user) => {
  let adminSettings = await getAdmin();
  if (adminSettings.isInMaintenance) return;

  if (messageReaction.message.channel.type === "DM") return;
  let member = messageReaction.message.guild.members.cache.get(user.id);

  if (
    member.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)
  ) {
    try {
      if (messageReaction.message.partial) {
        await messageReaction.message.fetch();
      }
    } catch (err) {
      return;
    }
    if (messageReaction.partial) await messageReaction.fetch();

    if (user.bot) return;

    if (messageReaction._emoji.id) {
      await reactionRoles.findOne(
        {
          guildID: messageReaction.message.channel.guild.id,
          messageID: messageReaction.message.id,
          reactionID: messageReaction._emoji.id,
        },
        async (err, reaction) => {
          if (!reaction) return;

          if (err) console.log(err.stack);
          if (reaction) {
            messageReaction.message.reactions
              .resolve(messageReaction)
              .users.remove(user.id);

            let role = messageReaction.message.guild.roles.cache.find(
              (c) => c.id === reaction.roleID
            );

            if (!role) return;

            if (member.roles.cache.has(role.id)) {
              if (!role) return;
              await member.roles.remove(role);
              return member
                .send({
                  embeds: [
                    embed(`**Reaction Roles**
                        Successfully removed you from \`${role.name}\` in \`${messageReaction.message.channel.guild.name}\``),
                  ],
                })
                .catch(() => {
                  messageReaction.message.channel
                    .send({
                      embeds: [
                        embed(`**Reaction-Roles** 
                            Successfully removed \`${role.name}\` from ${member}`),
                      ],
                    })
                    .then((msg) => {
                      msg.delete({
                        timeout: 4000,
                      });
                    });
                });
            }
          } else {
            if (!role) return;

            await member.roles.add(role);
            return member
              .send({
                embeds: [
                  embed(`**Reaction Roles**
                        Successfully gave you \`${role.name}\` in \`${messageReaction.message.channel.guild.name}\``),
                ],
              })
              .catch(() => {
                messageReaction.message.channel
                  .send({
                    embeds: [
                      embed(`**Reaction-Roles** 
                            Successfully gave ${member} \`${role.name}\``),
                    ],
                  })
                  .then((msg) => {
                    msg.delete({
                      timeout: 4000,
                    });
                  });
              });
          }
        }
      );
    } else {
      await reactionRoles.findOne(
        {
          guildID: messageReaction.message.channel.guild.id,
          messageID: messageReaction.message.id,
          reactionID: messageReaction._emoji.name,
        },
        async (err, reaction) => {
          if (err) console.log(err.stack);
          if (reaction) {
            messageReaction.message.reactions
              .resolve(messageReaction)
              .users.remove(user.id);
            let role = messageReaction.message.guild.roles.cache.find(
              (c) => c.id === reaction.roleID
            );

            if (!role) return;

            if (member.roles.cache.has(role.id)) {
              await member.roles.remove(role);

              return member
                .send({
                  embeds: [
                    embed(`**Reaction Roles**
                        Successfully removed you from \`${role.name}\` in \`${messageReaction.message.channel.guild.name}\``),
                  ],
                })
                .catch(() => {
                  messageReaction.message.channel
                    .send({
                      embeds: [
                        embed(`**Reaction-Roles** 
                            Successfully removed \`${role.name}\` from ${member}`),
                      ],
                    })
                    .then((msg) => {
                      msg.delete({
                        timeout: 4000,
                      });
                    });
                });
            } else {
              member.roles.add(role);

              return member
                .send({
                  embeds: [
                    embed(`**Reaction Roles**
                        Successfully gave you \`${role.name}\` in \`${messageReaction.message.channel.guild.name}\``),
                  ],
                })
                .catch(() => {
                  messageReaction.message.channel
                    .send({
                      embeds: [
                        embed(`**Reaction-Roles** 
                            Successfully gave ${member} \`${role.name}\``),
                      ],
                    })
                    .then((msg) => {
                      msg.delete({
                        timeout: 4000,
                      });
                    });
                });
            }
          }
        }
      );
    }
  } else {
    await reactionRoles.findOne(
      {
        guildID: messageReaction.message.channel.guild.id,
        messageID: messageReaction.message.id,
        reactionID: messageReaction._emoji.id,
      },
      async (err, reaction) => {
        if (!reaction) return;

        return member
          .send({
            embeds: [
              embed(`**Reaction Roles**
                        I couldn't give you the role as I do not have access to add or remove role.`),
            ],
          })
          .catch(() => {
            messageReaction.message.channel
              .send({
                embeds: [
                  embed(`**Reaction-Roles** 
                        I can't give people roles as I do not have access to add or remove role.`),
                ],
              })
              .then((msg) => {
                msg.delete({
                  timeout: 4000,
                });
              })
              .catch(async (err) => {});
          });
      }
    );
  }
};
