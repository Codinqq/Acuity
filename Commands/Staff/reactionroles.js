let { embed, noPerms } = require("../../Utils/Embeds");
const reactionRoles = require("../../Models/reactionRoles");
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reactionroles")
    .setDescription("Setup reaction roles for the server!")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (Acuity, interaction) => {

    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return interaction
        .reply({ embeds: [noPerms("Administrator")] })
        .then((m) =>
          interaction.fetchReply().then((m) => {
            setTimeout(() => {
              m.delete();
            }, 3000);
          })
        );

    interaction
      .reply({
        embeds: [
          embed(`**Reaction Roles**
        This is the wizard to add or remove reaction roles from messages.
        Please react with one of the emojis below to continue with the wizard.

        What do you want to do?
        1️⃣ - **Create an reaction role**
        2️⃣ - **Remove an reaction role**`),
        ],
      })
      .then(async (msg) => {
        await interaction.fetchReply().then(async (msg) => {
          await msg.react(`1️⃣`);
          await msg.react(`2️⃣`);

          Acuity.noLogs.set(
            `${interaction.guild.id}.${interaction.user.id}`,
            true
          );

          const reactFilter = (reaction, user) =>
            user.id === interaction.user.id;
          const msgFilter = (m) => m.user.id === interaction.user.id;
          var reactCollector = await msg.createReactionCollector(reactFilter, {
            time: 30000,
            max: 1,
          });

          reactCollector.on("collect", async (reaction, user) => {
            let emoji = reaction.emoji.name;
            msg.reactions.removeAll();

            if (emoji === "1️⃣") {
              await interaction.fetchReply().then((embedMsg) => {
                embedMsg
                  .edit({
                    embeds: [
                      embed(`**Reaction Roles**                    
                    Where do you want the reaction role to be?
                    
                    Please respond with the **name or the id** of your desired text-channel.`),
                    ],
                  })
                  .then(async (msg) => {
                    await interaction.fetchReply().then(async (msg) => {
                      var msgCollector = msg.channel.createMessageCollector({
                        msgFilter,
                        max: 1,
                      });

                      msgCollector.on("collect", async (response) => {
                        response.delete();

                        if (response.content.toLowerCase() === "cancel") {
                          return interaction.fetchReply().then((msg) => {
                            msg
                              .edit({
                                embeds: [
                                  embed(`**Reaction Roles**                                    
                                    Successfully cancelled the wizard.`),
                                ],
                              })
                              .then((m) =>
                                interaction.fetchReply().then((m) => {
                                  setTimeout(() => {
                                    m.delete();
                                  }, 3000);
                                })
                              );
                          });
                        }

                        let channelID = response.content;
                        let reactChannel =
                          interaction.guild.channels.cache.find(
                            (c) => c.id === channelID || c.name === channelID
                          );

                        if (!reactChannel) {
                          return interaction.fetchReply().then((msg) => {
                            msg.edit({
                              embeds: [
                                embed(`**Reaction-Roles**                    
                                    I couldn't find a channel with **${channelID}** as the name or id.

                                    To fix this, please redo the wizard.`),
                              ],
                            });
                          });
                        }

                        if (
                          !interaction.guild.members.me
                            .permissionsIn(reactChannel)
                            .has(PermissionFlagsBits.AddReactions)
                        ) {
                          return interaction.reply({
                            embeds: [
                              embed(`**Reaction Roles**            
                            I do not have permission to add reactions in the ${reactChannel} channel
                            
                            Please let me be able to add reactions in that channel before trying again`),
                            ],
                          });
                        }

                        interaction.fetchReply().then(async (msgEmbed) => {
                          msgEmbed
                            .edit({
                              embeds: [
                                embed(`**Reaction Roles**
                                Which message do you want to add the reaction role to?
                                
                                Please respond with the **id of the message** in the desired text-channel.`),
                              ],
                            })
                            .then(async (msg) => {
                              await interaction
                                .fetchReply()
                                .then(async (msg) => {
                                  Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,true)

                                  var msgCollector =
                                    msg.channel.createMessageCollector({
                                      msgFilter,
                                      max: 1,
                                    });

                                  msgCollector.on(
                                    "collect",
                                    async (response) => {
                                      response.delete();

                                      if (
                                        response.content.toLowerCase() ===
                                        "cancel"
                                      ) {
                                        return interaction
                                          .fetchReply()
                                          .then((msg) => {
                                            Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                                            msg
                                              .edit({
                                                embeds: [
                                                  embed(`**Reaction Roles**                                                
                                            Successfully cancelled the wizard.`),
                                                ],
                                              })
                                              .then((m) =>
                                                interaction
                                                  .fetchReply()
                                                  .then((m) => {
                                                    setTimeout(() => {
                                                      m.delete();
                                                    }, 3000);
                                                  })
                                              );
                                          });
                                      }

                                      let messageID = response.content;
                                      let reactMessage = reactChannel.messages
                                        .fetch(messageID)
                                        .then((m) => {
                                          if (!reactMessage) {
                                            return interaction
                                              .fetchReply()
                                              .then((msg) => {
                                                Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                                                msg.edit({
                                                  embeds: [
                                                    embed(`**Reaction-Roles**                    
                                                I couldn't find a message within the channel with **${messageID}** as the id.

                                                To fix this, please redo the wizard.`),
                                                  ],
                                                });
                                              });
                                          }

                                          interaction
                                            .fetchReply()
                                            .then(async (msg) => {
                                              Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                                              msg
                                                .edit({
                                                  embeds: [
                                                    embed(`**Reaction Roles**                                            
                                            Which emoji do you want the role to be given at when clicked?
                                            
                                            React to the message with the emoji.`),
                                                  ],
                                                })
                                                .then(async (msg) => {
                                                  await interaction
                                                    .fetchReply()
                                                    .then(async (msg) => {
                                                      reactCollector =
                                                        await msg.createReactionCollector(
                                                          {
                                                            reactFilter,
                                                            time: 30000,
                                                            max: 1,
                                                          }
                                                        );

                                                      reactCollector.on(
                                                        "collect",
                                                        async (
                                                          reaction,
                                                          user
                                                        ) => {
                                                          msg.reactions.removeAll();

                                                          let emoji =
                                                            reaction.emoji;

                                                          interaction
                                                            .fetchReply()
                                                            .then((msg) => {
                                                              msg
                                                                .edit({
                                                                  embeds: [
                                                                    embed(`**Reaction Roles**                                                        
                                                        Which role do you want to give to the user when the reaction has been clicked?
                                                        
                                                        Please respond with the **name or the id** of the role.`),
                                                                  ],
                                                                })
                                                                .then(
                                                                  async (
                                                                    msg
                                                                  ) => {
                                                                    await interaction
                                                                      .fetchReply()
                                                                      .then(
                                                                        async (
                                                                          msg
                                                                        ) => {
                                                                          Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,true)

                                                                          var msgCollector =
                                                                            msg.channel.createMessageCollector(
                                                                              {
                                                                                msgFilter,
                                                                                max: 1,
                                                                              }
                                                                            );

                                                                          msgCollector.on(
                                                                            "collect",
                                                                            async (
                                                                              response
                                                                            ) => {
                                                                              let roleResp =
                                                                                response.content;
                                                                              response.delete();

                                                                              if (
                                                                                response.content.toLowerCase() ===
                                                                                "cancel"
                                                                              ) {
                                                                                return interaction
                                                                                  .fetchReply()
                                                                                  .then(
                                                                                    (
                                                                                      msg
                                                                                    ) => {
                                                                                      Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                                                                                      msg
                                                                                        .edit(
                                                                                          {
                                                                                            embeds:
                                                                                              [
                                                                                                embed(`**Reaction Roles**                                                                    
                                                                    Successfully cancelled the wizard.`),
                                                                                              ],
                                                                                          }
                                                                                        )
                                                                                        .then(
                                                                                          (
                                                                                            m
                                                                                          ) =>
                                                                                            interaction
                                                                                              .fetchReply()
                                                                                              .then(
                                                                                                (
                                                                                                  m
                                                                                                ) => {
                                                                                                  setTimeout(
                                                                                                    () => {
                                                                                                      m.delete();
                                                                                                    },
                                                                                                    3000
                                                                                                  );
                                                                                                }
                                                                                              )
                                                                                        );
                                                                                    }
                                                                                  );
                                                                              }

                                                                              let role =
                                                                                interaction.guild.roles.cache.find(
                                                                                  (
                                                                                    r
                                                                                  ) =>
                                                                                    r.name ===
                                                                                      roleResp ||
                                                                                    r.id ===
                                                                                      roleResp
                                                                                );

                                                                              if (
                                                                                !role
                                                                              ) {
                                                                                return interaction
                                                                                  .fetchReply()
                                                                                  .then(
                                                                                    (
                                                                                      msg
                                                                                    ) => {
                                                                                      Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                                                                                      msg.edit(
                                                                                        {
                                                                                          embeds:
                                                                                            [
                                                                                              embed(`**Reaction-Roles**                    
                                                                    I couldn't find a role with **${roleResp}** as the id or name.

                                                                    To fix this, please redo the wizard.`),
                                                                                            ],
                                                                                        }
                                                                                      );
                                                                                    }
                                                                                  );
                                                                              }

                                                                              if (
                                                                                emoji.id !=
                                                                                null
                                                                              ) {
                                                                                m.react(
                                                                                  emoji.id
                                                                                );
                                                                              } else {
                                                                                m.react(
                                                                                  emoji.name
                                                                                );
                                                                              }

                                                                              if (
                                                                                emoji.id !=
                                                                                null
                                                                              ) {
                                                                                reactionRoles.findOne(
                                                                                  {
                                                                                    guildID:
                                                                                      interaction
                                                                                        .guild
                                                                                        .id,
                                                                                    messageID:
                                                                                      m.id,
                                                                                    reactionID:
                                                                                      emoji.id,
                                                                                  },
                                                                                  async (
                                                                                    react
                                                                                  ) => {
                                                                                    if (
                                                                                      !react
                                                                                    ) {
                                                                                      const newReaction =
                                                                                        new reactionRoles(
                                                                                          {
                                                                                            guildID:
                                                                                              interaction
                                                                                                .guild
                                                                                                .id,
                                                                                            messageID:
                                                                                              m.id,
                                                                                            channelID:
                                                                                              reactChannel.id,
                                                                                            customEmoji: true,
                                                                                            reactionID:
                                                                                              emoji.id,
                                                                                            roleID:
                                                                                              role.id,
                                                                                          }
                                                                                        );

                                                                                      newReaction
                                                                                        .save()
                                                                                        .catch(
                                                                                          (
                                                                                            err
                                                                                          ) =>
                                                                                            console.log(
                                                                                              err
                                                                                            )
                                                                                        );
                                                                                    } else {
                                                                                      return interaction
                                                                                        .fetchReply()
                                                                                        .then(
                                                                                          (
                                                                                            msg
                                                                                          ) => {
                                                                                            msg.edit(
                                                                                              {
                                                                                                embeds:
                                                                                                  [
                                                                                                    embed(`**Reaction-Roles**                    
                                                                            There's already a reaction-role that uses that emoji on the desired message.
                                                                            
                                                                            To fix this, please remove that reaction-role using the wizard, and then add the new reaction-role.`),
                                                                                                  ],
                                                                                              }
                                                                                            );
                                                                                          }
                                                                                        );
                                                                                    }
                                                                                  }
                                                                                );
                                                                              } else if (
                                                                                emoji.id ===
                                                                                null
                                                                              ) {
                                                                                reactionRoles.findOne(
                                                                                  {
                                                                                    guildID:
                                                                                      interaction
                                                                                        .guild
                                                                                        .id,
                                                                                    messageID:
                                                                                      m.id,
                                                                                    reactionID:
                                                                                      emoji.name,
                                                                                  },
                                                                                  async (
                                                                                    react
                                                                                  ) => {
                                                                                    if (
                                                                                      !react
                                                                                    ) {
                                                                                      const newReaction =
                                                                                        new reactionRoles(
                                                                                          {
                                                                                            guildID:
                                                                                              interaction
                                                                                                .guild
                                                                                                .id,
                                                                                            messageID:
                                                                                              m.id,
                                                                                            channelID:
                                                                                              reactChannel.id,
                                                                                            customEmoji: false,
                                                                                            reactionID:
                                                                                              emoji.name,
                                                                                            roleID:
                                                                                              role.id,
                                                                                          }
                                                                                        );

                                                                                      newReaction
                                                                                        .save()
                                                                                        .catch(
                                                                                          (
                                                                                            err
                                                                                          ) =>
                                                                                            console.log(
                                                                                              err
                                                                                            )
                                                                                        );
                                                                                    } else {
                                                                                      return interaction
                                                                                        .fetchReply()
                                                                                        .then(
                                                                                          (
                                                                                            msg
                                                                                          ) => {
                                                                                            msg.edit(
                                                                                              {
                                                                                                embeds:
                                                                                                  [
                                                                                                    embed(`**Reaction-Roles**                    
                                                                            There's already a reaction-role that uses that emoji on the desired message.

                                                                            To fix this, please remove the reaction-role that is using the wizard, and then add the new reaction-role.`),
                                                                                                  ],
                                                                                              }
                                                                                            );
                                                                                          }
                                                                                        );
                                                                                    }
                                                                                  }
                                                                                );
                                                                              }

                                                                              interaction
                                                                                .fetchReply()
                                                                                .then(
                                                                                  (
                                                                                    msgEmbed
                                                                                  ) => {
                                                                                    msgEmbed
                                                                                      .edit(
                                                                                        {
                                                                                          embeds:
                                                                                            [
                                                                                              embed(`**Reaction Roles**
                                                                ${role} will now be given to the user when reacting to [this message](${m.url}) with ${emoji}`),
                                                                                            ],
                                                                                        }
                                                                                      )
                                                                                      .then(
                                                                                        (
                                                                                          m
                                                                                        ) =>
                                                                                          interaction
                                                                                            .fetchReply()
                                                                                            .then(
                                                                                              (
                                                                                                m
                                                                                              ) => {
                                                                                                setTimeout(
                                                                                                  () => {
                                                                                                    m.delete();
                                                                                                  },
                                                                                                  3000
                                                                                                );
                                                                                              }
                                                                                            )
                                                                                      );
                                                                                  }
                                                                                );
                                                                            }
                                                                          );
                                                                        }
                                                                      );
                                                                  }
                                                                );
                                                            });
                                                        }
                                                      );
                                                    });
                                                });
                                            });
                                        });
                                    }
                                  );
                                });
                            });
                        });
                      });
                    });
                  });
              });
            }
            if (emoji === "2️⃣") {
              await interaction.fetchReply().then(async (embedMsg) => {
                embedMsg
                  .edit({
                    embeds: [
                      embed(`**Reaction Roles**
                  From which message do you want to remove the reaction-role from?`),
                    ],
                  })
                  .then((msg) => {
                    Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,true)
                    var msgCollector = msg.channel.createMessageCollector({
                      msgFilter,
                      max: 1,
                    });

                    msgCollector.on("collect", async (response) => {
                      response.delete();

                      if (response.content.toLowerCase() === "cancel") {
                        return interaction.fetchReply().then((msg) => {
                          msg
                            .edit({
                              embeds: [
                                embed(`**Reaction Roles**
                                  Successfully cancelled the wizard.`),
                              ],
                            })
                            .then((m) =>
                              interaction.fetchReply().then((m) => {
                                Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                                setTimeout(() => {
                                  m.delete();
                                }, 3000);
                              })
                            );
                        });
                      }

                      let messageID = response.content;

                      interaction.fetchReply().then((msg) => {
                        msg
                          .edit({
                            embeds: [
                              embed(`**Reaction Roles**
                                      Which reaction do you want to remove?
                                      
                                      React to the message with the emoji`),
                            ],
                          })
                          .then(async (msg) => {
                            Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                            await interaction
                              .fetchReply()
                              .then(async (msg) => {
                                reactCollector =
                                  await msg.createReactionCollector({
                                    reactFilter,
                                    time: 30000,
                                    max: 1,
                                  });

                                reactCollector.on(
                                  "collect",
                                  async (reaction, user) => {
                                    msg.reactions.removeAll();

                                    let emoji = reaction.emoji;

                                    if (emoji.id != null) {
                                      reactionRoles.findOneAndRemove(
                                        {
                                          guildID: interaction.guild.id,
                                          messageID: messageID,
                                          reactionID: emoji.id,
                                        },
                                        async (err, reacts) => {
                                          if (err) console.log(err.stack);
                                        }
                                      );
                                    } else {
                                      reactionRoles.findOneAndRemove(
                                        {
                                          guildID: interaction.guild.id,
                                          messageID: messageID,
                                          reactionID: emoji.name,
                                        },
                                        async (err, reacts) => {
                                          if (err) console.log(err.stack);
                                        }
                                      );
                                    }

                                    interaction.fetchReply().then((msg) => {
                                      msg
                                        .edit({
                                          embeds: [
                                            embed(`**Reaction Roles**
                                      The reaction role has been removed.`),
                                          ],
                                        })
                                        .then((m) =>
                                          interaction
                                            .fetchReply()
                                            .then((m) => {
                                              setTimeout(() => {
                                                m.delete();
                                              }, 3000);
                                            })
                                        );
                                    });
                                  }
                                );
                              });
                          });
                      });
                    });
                  });
              });
            }
          });
        });
      });
  },
};
