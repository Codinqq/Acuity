const {
  ButtonBuilder,
  SlashCommandBuilder,
  ActionRowBuilder,
  PermissionFlagsBits,
  ButtonStyle,
} = require("discord.js");

const prettyMS = require("pretty-ms");
const ms = require("ms");

let { getGuild } = require("../../Utils/Database");
let { embed, noPerms } = require("../../Utils/Embeds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dashboard")
    .setDescription("Edit Acuitys settings!")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (Acuity, interaction) => {

    const buttonFilter = (i) =>
      i.message.id === msg.id && i.user.id === interaction.member.id;
    const msgFilter = (m) => m.user.id === interaction.user.id;

    let channelRegex = /<#(\d{17,19})>/i;
    let roleRegex = /<@&(\d{17,19})>/i;
    let userRegex = /<@!?(\d{17,19})>/i;

    async function mainMenu(i) {
      let guild = await getGuild(interaction.guild.id);

      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
        return interaction
          .reply({
            embeds: [noPerms("Administrator")],
          })
          .then((m) =>
            interaction.fetchReply().then(async (m) =>
              setTimeout(() => {
                m.delete();
              }, 5000)
            )
          );

      let botChannel = interaction.guild.channels.cache.find(
        (c) => c.id === guild.settings.channels.botLogs
      );
      if (!botChannel) botChannel = "None.";

      let { channels } = guild.settings;
      let { memberLogs, levels, advancedLogs, automod, security } =
        guild.addons;

      const settingsRow1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("settingsButton")
          .setLabel("Settings")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("levelsButton")
          .setLabel("Levels")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("memberLogsButton")
          .setLabel("Member Logs")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("autoModButton")
          .setLabel("Auto Mod")
          .setStyle(ButtonStyle.Primary)
      );

      const settingsRow2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("advancedLogsButton")
          .setLabel("Advanced Logs")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("securityButton")
          .setLabel("Security")
          .setStyle(ButtonStyle.Primary)
      );

      if (i !== null) {
        await interaction.fetchReply().then((msg) => {
          if (i.replied) {
            i.editReply({
              embeds: [
                embed(`**Dashboard**
                      Click on one of the buttons down below to edit settings!`),
              ],
              components: [settingsRow1, settingsRow2],
            });
          } else {
            i.update({
              embeds: [
                embed(`**Dashboard**
                      Click on one of the buttons down below to edit settings!`),
              ],
              components: [settingsRow1, settingsRow2],
            });
          }
        });
      }

      if (i == null) {
        interaction.reply({
          embeds: [
            embed(`**Dashboard**
                Click on one of the buttons down below to edit settings!`),
          ],
          components: [settingsRow1, settingsRow2],
        });
      }

      await interaction.fetchReply().then((msg) => {
        const collector = interaction.channel.createMessageComponentCollector({
          buttonFilter,
          time: 30000,
          max: 1,
        });
        collector.on("collect", async (i) => {
          if (i.customId === "settingsButton") {
            const settingsRow = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId("editBotLogsButton")
                .setLabel("Change Log Channel")
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId("settingsBack")
                .setLabel("Go back")
                .setStyle(ButtonStyle.Danger)
            );

            async function settingsMenu(i) {
              await interaction.fetchReply().then(async (msg) => {
                if (!i.replied) {
                  i.update({
                    embeds: [
                      embed(`**Dashboard**
                                      Log-Channel
                                      > ${botChannel}`),
                    ],
                    components: [settingsRow],
                  });
                } else {
                  i.editReply({
                    embeds: [
                      embed(`**Dashboard**
                                      Log-Channel
                                      > ${botChannel}`),
                    ],
                    components: [settingsRow],
                  });
                }

                const collector =
                  interaction.channel.createMessageComponentCollector({
                    buttonFilter,
                    time: 30000,
                    max: 1,
                  });
                collector.on("collect", async (i) => {
                  if (i.customId === "settingsBack") {
                    return mainMenu(i);
                  }

                  if (i.customId === "editBotLogsButton") {
                    i.update({
                      embeds: [
                        embed(`**Dashboard**
                                        Please write the name or the id of the channel in the chat.`),
                      ],
                      components: [],
                    }).then((int) => {
                      interaction.fetchReply().then(async (msg) => {
                        Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,true)

                        var msgCollector = msg.channel.createMessageCollector({
                          msgFilter,
                          max: 1,
                        });

                        msgCollector.on("collect", async (collected) => {
                          collected.delete();

                          let channel;

                          if (channelRegex.test(collected.content) === true) {
                            channel = interaction.guild.channels.cache.find(
                              (c) =>
                                c.id === channelRegex.exec(collected.content)[1]
                            );
                          } else {
                            channel = interaction.guild.channels.cache.find(
                              (c) =>
                                c.id === collected.content ||
                                c.name === collected.content
                            );
                          }

                          if (!channel) {
                            return i
                              .editReply({
                                embeds: [
                                  embed(`**Dashboard**
                                          ❌ That is not a valid channel!`),
                                ],
                                components: [],
                              })
                              .then((msg) => {
                                Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)

                                setTimeout(() => {
                                  settingsMenu(i);
                                }, 3000);
                              });
                          }

                          channels.botLogs = channel.id;

                          channel
                            .send({
                              embeds: [
                                embed(`**Dashboard**
                                    ✅ This is now the new logging channel!`),
                              ],
                            })
                            .then(async (msg) => {
                              Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                              setTimeout(() => {
                                msg.delete();
                              }, 5000);
                            });

                          return guild
                            .save()
                            .then(() => {
                              i.editReply({
                                embeds: [
                                  embed(`**Dashboard**
                                              ✅ Successfully set the logging channel to <#${channel.id}>!`),
                                ],
                                components: [],
                              });

                              setTimeout(() => {
                                return settingsMenu(i);
                              }, 3000);
                            })
                            .catch((err) => {
                              Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                              i.editReply({
                                embeds: [
                                  embed(`**Dashboard**
                                            ❌ I couldn't save the settings.
                                            
                                            **Error Message**
                                            > ${err.stack}`),
                                ],
                                components: [],
                              });
                              setTimeout(() => {
                                settingsMenu(i);
                              }, 3000);
                            });
                        });
                      });
                    });
                  }
                });
              });
            }
            settingsMenu(i);
          }
          if (i.customId === "levelsButton") {
            let rewards = "";
            for (var a in levels.rewards) {
              if (levels.rewards[a]) {
                rewards += `> ${
                  levels.rewards[a].level
                } - ${interaction.guild.roles.cache.find(
                  (r) => r.id === levels.rewards[a].rewardID
                )}\n`;
              }
            }

            const settingsRow = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId("toggleLevelsButton")
                .setLabel("Toggle Levels")
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId("editLevelUpMsgButton")
                .setLabel("Change Level-up Message")
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId("editRewardsButton")
                .setLabel("Edit rewards")
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId("settingsBack")
                .setLabel("Go back")
                .setStyle(ButtonStyle.Danger)
            );

            async function levelsMenu(i) {
              if (i.replied) {
                i.editReply({
                  embeds: [
                    embed(`**Levels**
                              Enabled - ${levels.enabled ? "✅" : "❌"}
  
                              Level-Up message
                              > ${levels.levelupMessage}
  
                              Rewards
                              > ${
                                rewards.length > 0
                                  ? rewards
                                  : "No rewards found!"
                              }`),
                  ],
                  components: [settingsRow],
                });
              } else {
                i.update({
                  embeds: [
                    embed(`**Levels**
                              Enabled - ${levels.enabled ? "✅" : "❌"}
  
                              Level-Up message
                              > ${levels.levelupMessage}
  
                              Rewards
                              > ${
                                rewards.length > 0
                                  ? rewards
                                  : "No rewards found!"
                              }`),
                  ],
                  components: [settingsRow],
                });
              }

              const collector =
                interaction.channel.createMessageComponentCollector({
                  buttonFilter,
                  time: 30000,
                  max: 1,
                });
              collector.on("collect", async (i) => {
                if (i.customId === "settingsBack") {
                  return mainMenu(i);
                }

                if (i.customId === "toggleLevelsButton") {
                  levels.enabled = !levels.enabled;

                  return guild
                    .save()
                    .then(() => {
                      i.update({
                        embeds: [
                          embed(`**Levels**
                                ✅ The levels module has been **${
                                  levels.enabled ? "enabled" : "disabled"
                                }**`),
                        ],
                        components: [],
                      });
                      setTimeout(() => {
                        levelsMenu(i);
                      }, 3000);
                    })
                    .catch((err) => {
                      i.update({
                        embeds: [
                          embed(`**Dashboard**
                                  ❌ I couldn't save the settings.
                                  
                                  **Error Message**
                                  > ${err.stack}`),
                        ],
                        components: [],
                      });
                      setTimeout(() => {
                        levelsMenu(i);
                      }, 3000);
                    });
                }

                if (i.customId === "editLevelUpMsgButton") {
                  i.update({
                    embeds: [
                      embed(`**Levels**
                                Current Level-Up message
                                > ${levels.levelupMessage}

                                **Use [XP] for xp, [LEVEL] for level and [USER] for user**
                                
                                Please write the new level-up message in the chat.`),
                    ],
                    components: [],
                  }).then((msg) => {
                    interaction.fetchReply().then(async (msg) => {
                      Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,true)

                      var msgCollector = msg.channel.createMessageCollector({
                        msgFilter,
                        max: 1,
                      });

                      msgCollector.on("collect", async (collected) => {
                        collected.delete();

                        let levelupMessage = collected.content;

                        levels.levelupMessage = levelupMessage;

                        return guild
                          .save()
                          .then(() => {
                            Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                            i.editReply({
                              embeds: [
                                embed(`**Levels**
                                    ✅ The level-up message has been changed to
                                    > ${levelupMessage}`),
                              ],
                              components: [],
                            });
                            setTimeout(() => {
                              levelsMenu(i);
                            }, 3000);
                          })
                          .catch((err) => {
                            Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                            i.editReply({
                              embeds: [
                                embed(`**Dashboard**
                                      ❌ I couldn't save the settings.
                                      
                                      **Error Message**
                                      > ${err.stack}`),
                              ],
                              components: [],
                            });
                            setTimeout(() => {
                              levelsMenu(i);
                            }, 3000);
                          });
                      });
                    });
                  });
                }

                if (i.customId === "editRewardsButton") {
                  const settingsRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                      .setCustomId("addRewardButton")
                      .setLabel("Add reward")
                      .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                      .setCustomId("editRewardButton")
                      .setLabel("Edit reward")
                      .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                      .setCustomId("removeRewardButton")
                      .setLabel("Remove reward")
                      .setStyle(ButtonStyle.Danger)
                  );

                  i.update({
                    embeds: [
                      embed(`**Levels**
                              Current rewards:
                              > ${
                                rewards.length > 0
                                  ? rewards
                                  : "**No rewards found!**\n**Please create a new one!**"
                              }
                              
                              What do you want to do?`),
                    ],
                    components: [settingsRow],
                  }).then((msg) => {
                    const collector =
                      interaction.channel.createMessageComponentCollector({
                        buttonFilter,
                        time: 30000,
                        max: 1,
                      });
                    collector.on("collect", async (i) => {
                      if (i.customId === "addRewardButton") {
                        i.update({
                          embeds: [
                            embed(`**Levels**
                                      Which level do you want the reward to be given at?`),
                          ],
                          components: [],
                        }).then((msg) => {
                          interaction.fetchReply().then(async (msg) => {
                            Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,true)
                            var msgCollector =
                              msg.channel.createMessageCollector({
                                msgFilter,
                                max: 1,
                              });

                            msgCollector.on("collect", async (collected) => {
                              collected.delete();

                              let rewardLevel = collected.content;

                              if (isNaN(rewardLevel)) {
                                return i
                                  .editReply({
                                    embeds: [
                                      embed(`**Levels**
                                            ❌ That is not a valid number.`),
                                    ],
                                  })
                                  .then((msg) => {
                                    Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                                    setTimeout(() => {
                                      levelsMenu(i);
                                    }, 3000);
                                  });
                              }

                              i.editReply({
                                embeds: [
                                  embed(`**Levels**
                                          Which role do you want to be given when reaching the level?`),
                                ],
                              }).then((msg) => {
                                interaction.fetchReply().then(async (msg) => {
                                  var msgCollector =
                                    msg.channel.createMessageCollector({
                                      msgFilter,
                                      max: 1,
                                    });

                                  msgCollector.on(
                                    "collect",
                                    async (collected) => {
                                      collected.delete();

                                      let rewardRole = collected.content;

                                      if (roleRegex.test(rewardRole)) {
                                        rewardRole = msg.guild.roles.cache.find(
                                          (c) =>
                                            c.id ===
                                            roleRegex.exec(rewardRole)[1]
                                        );
                                      } else {
                                        rewardRole = msg.guild.roles.cache.find(
                                          (c) =>
                                            c.id === rewardRole ||
                                            c.name === rewardRole
                                        );
                                      }

                                      if (!rewardRole) {
                                        return i
                                          .editReply({
                                            embeds: [
                                              embed(`**Levels**
                                                ❌ That is not a valid role!`),
                                            ],
                                          })
                                          .then((msg) => {
                                            Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                                            setTimeout(() => {
                                              levelsMenu(i);
                                            }, 3000);
                                          });
                                      }

                                      let jsonReward = {
                                        level: Number(rewardLevel),
                                        rewardID: rewardRole.id,
                                      };

                                      levels.rewards.push(jsonReward);

                                      return guild
                                        .save()
                                        .then(() => {
                                          Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                                          i.editReply({
                                            embeds: [
                                              embed(`**Levels**
                                              ✅ Successfully added ${rewardRole} as the reward for reaching ${rewardLevel}`),
                                            ],
                                          });
                                          setTimeout(() => {
                                            levelsMenu(i);
                                          }, 3000);
                                        })
                                        .catch((err) => {
                                          Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                                          i.editReply({
                                            embeds: [
                                              embed(`**Dashboard**
                                                ❌ I couldn't save the settings.
                                                
                                                **Error Message**
                                                > ${err.stack}`),
                                            ],
                                            components: [],
                                          });
                                          setTimeout(() => {
                                            levelsMenu(i);
                                          }, 3000);
                                        });
                                    }
                                  );
                                });
                              });
                            });
                          });
                        });
                      }

                      if (i.customId === "editRewardButton") {
                        if (levels.rewards.length <= 0) {
                          return i.update({
                            embeds: [
                              embed(`**Levels**
                                        ❌ There isn't any rewards to be edited!`),
                            ],
                            components: [],
                          });
                        }

                        let rewards = "";
                        for (var a in levels.rewards) {
                          if (levels.rewards[a]) {
                            rewards += `${Number(a) + 1} - ${
                              levels.rewards[a].level
                            } - ${interaction.guild.roles.cache.find(
                              (r) => r.id === levels.rewards[a].rewardID
                            )}\n`;
                          }
                        }

                        i.update({
                          embeds: [
                            embed(`**Levels**
                                      > ${rewards}

                                      Which reward do you want to edit?                                      
                                      `),
                          ],
                          components: [],
                        }).then((msg) => {
                          interaction.fetchReply().then(async (msg) => {
                            Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,true)
                            var msgCollector =
                              msg.channel.createMessageCollector({
                                msgFilter,
                                max: 1,
                              });

                            msgCollector.on("collect", async (collected) => {
                              collected.delete();

                              let rewardNumber = collected.content;

                              if (isNaN(rewardNumber)) {
                                return i
                                  .editReply({
                                    embeds: [
                                      embed(`**Levels**
                                            ❌ That is not a valid number.`),
                                    ],
                                  })
                                  .then((msg) => {
                                    Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                                    setTimeout(() => {
                                      levelsMenu(i);
                                    }, 3000);
                                  });
                              }

                              rewardNumber = Number(rewardNumber) - 1;

                              let reward = levels.rewards[rewardNumber];

                              const settingsRow =
                                new ActionRowBuilder().addComponents(
                                  new ButtonBuilder()
                                    .setCustomId("editLevelButton")
                                    .setLabel("Edit level")
                                    .setStyle(ButtonStyle.Primary),
                                  new ButtonBuilder()
                                    .setCustomId("editRoleButton")
                                    .setLabel("Edit role")
                                    .setStyle(ButtonStyle.Primary)
                                );

                              i.editReply({
                                embeds: [
                                  embed(`**Levels**
                                          Currently editing the reward for ${
                                            reward.level
                                          }.
                                          Current role: ${msg.guild.roles.cache.find(
                                            (c) => c.id === reward.rewardID
                                          )}`),
                                ],
                                components: [settingsRow],
                              }).then((msg) => {
                                const collector =
                                  interaction.channel.createMessageComponentCollector(
                                    {
                                      buttonFilter,
                                      time: 30000,
                                      max: 1,
                                    }
                                  );
                                collector.on("collect", async (i) => {
                                  if (i.customId === "editLevelButton") {
                                    i.update({
                                      embeds: [
                                        embed(`**Levels**
                                                  Currently editing the reward for ${
                                                    reward.level
                                                  }.
                                                  Current role: ${msg.guild.roles.cache.find(
                                                    (c) =>
                                                      c.id === reward.rewardID
                                                  )}
                                                  
                                                  What do you want the new level to be?`),
                                      ],
                                      components: [],
                                    }).then((msg) => {
                                      interaction
                                        .fetchReply()
                                        .then(async (msg) => {
                                          var msgCollector =
                                            msg.channel.createMessageCollector({
                                              msgFilter,
                                              max: 1,
                                            });

                                          msgCollector.on(
                                            "collect",
                                            async (collected) => {
                                              collected.delete();

                                              if (isNaN(collected.content)) {
                                                Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                                                return i
                                                  .editReply({
                                                    embeds: [
                                                      embed(`**Levels**
                                                    ❌ That is not a valid number.`),
                                                    ],
                                                  })
                                                  .then((msg) => {
                                                    setTimeout(() => {
                                                      levelsMenu(i);
                                                    }, 3000);
                                                  });
                                              }

                                              guild.addons.levels.rewards[
                                                rewardNumber
                                              ] = {
                                                rewardID: reward.rewardID,
                                                level: Number(
                                                  collected.content
                                                ),
                                              };

                                              guild.markModified(
                                                "addons.levels.rewards"
                                              );

                                              return guild
                                                .save()
                                                .then(() => {
                                                  Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                                                  i.editReply({
                                                    embeds: [
                                                      embed(`**Levels**
                                                  ✅ Succesfully set the reward-level to ${collected.content}!`),
                                                    ],
                                                    components: [],
                                                  });
                                                  setTimeout(() => {
                                                    levelsMenu(i);
                                                  }, 3000);
                                                })
                                                .catch((err) => {
                                                  Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                                                  i.editReply({
                                                    embeds: [
                                                      embed(`**Dashboard**
                                                    ❌ I couldn't save the settings.
                                                    
                                                    **Error Message**
                                                    > ${err.stack}`),
                                                    ],
                                                    components: [],
                                                  });
                                                  setTimeout(() => {
                                                    levelsMenu(i);
                                                  }, 3000);
                                                });
                                            }
                                          );
                                        });
                                    });
                                  }
                                  if (i.customId === "editRoleButton") {
                                    i.update({
                                      embeds: [
                                        embed(`**Levels**
                                                  Currently editing the reward for ${
                                                    reward.level
                                                  }.
                                                  Current role: ${msg.guild.roles.cache.find(
                                                    (c) =>
                                                      c.id === reward.rewardID
                                                  )}
                                                  
                                                  What do you want the new role to be?`),
                                      ],
                                      components: [],
                                    }).then((msg) => {
                                      interaction
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
                                            async (collected) => {
                                              collected.delete();

                                              let rewardRole =
                                                collected.content;

                                              if (roleRegex.test(rewardRole)) {
                                                rewardRole =
                                                  msg.guild.roles.cache.find(
                                                    (c) =>
                                                      c.id ===
                                                      roleRegex.exec(
                                                        rewardRole
                                                      )[1]
                                                  );
                                              } else {
                                                rewardRole =
                                                  msg.guild.roles.cache.find(
                                                    (c) =>
                                                      c.id === rewardRole ||
                                                      c.name === rewardRole
                                                  );
                                              }

                                              if (!rewardRole) {
                                                return i
                                                  .editReply({
                                                    embeds: [
                                                      embed(`**Levels**
                                                    ❌ That is not a valid role!`),
                                                    ],
                                                  })
                                                  .then((msg) => {
                                                    Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                                                    setTimeout(() => {
                                                      levelsMenu(i);
                                                    }, 3000);
                                                  });
                                              }

                                              guild.addons.levels.rewards[
                                                rewardNumber
                                              ] = {
                                                rewardID: rewardRole.id,
                                                level: reward.level,
                                              };
                                              guild.markModified(
                                                "addons.levels.rewards"
                                              );

                                              return guild
                                                .save()
                                                .then(() => {
                                                  Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                                                  i.editReply({
                                                    embeds: [
                                                      embed(`**Levels**
                                                    ✅ Succesfully set the reward-role to ${rewardRole}!`),
                                                    ],
                                                    components: [],
                                                  });
                                                  setTimeout(() => {
                                                    levelsMenu(i);
                                                  }, 3000);
                                                })
                                                .catch((err) => {
                                                  Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                                                  i.editReply({
                                                    embeds: [
                                                      embed(`**Dashboard**
                                                    ❌ I couldn't save the settings.
                                                    
                                                    **Error Message**
                                                    > ${err.stack}`),
                                                    ],
                                                    components: [],
                                                  });
                                                  setTimeout(() => {
                                                    levelsMenu(i);
                                                  }, 3000);
                                                });
                                            }
                                          );
                                        });
                                    });
                                  }
                                });
                              });
                            });
                          });
                        });
                      }

                      if (i.customId === "removeRewardButton") {
                        if (levels.rewards.length <= 0) {
                          return i
                            .update({
                              embeds: [
                                embed(`**Levels**
                                        ❌ There isn't any rewards to be removed!`),
                              ],
                              components: [],
                            })
                            .then((msg) => {
                              setTimeout(() => {
                                levelsMenu(i);
                              }, 3000);
                            });
                        }
                        let rewards = "";
                        for (var a in levels.rewards) {
                          if (levels.rewards[a]) {
                            rewards += `${Number(a) + 1} - ${
                              levels.rewards[a].level
                            } - ${interaction.guild.roles.cache.find(
                              (r) => r.id === levels.rewards[a].rewardID
                            )}\n`;
                          }
                        }

                        i.update({
                          embeds: [
                            embed(`**Levels**
                                      > ${rewards}

                                      Which reward do you want to remove?                                      
                                      `),
                          ],
                          components: [],
                        }).then((msg) => {
                          interaction.fetchReply().then(async (msg) => {
                            Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,true)

                            var msgCollector =
                              msg.channel.createMessageCollector({
                                msgFilter,
                                max: 1,
                              });

                            msgCollector.on("collect", async (collected) => {
                              collected.delete();

                              let rewardNumber = collected.content;

                              if (isNaN(rewardNumber)) {
                                return i
                                  .editReply({
                                    embeds: [
                                      embed(`**Levels**
                                                    ❌ That is not a valid number!`),
                                    ],
                                  })
                                  .then((msg) => {
                                    Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                                    setTimeout(() => {
                                      levelsMenu(i);
                                    }, 3000);
                                  });
                              }

                              if (rewardNumber > levels.rewards.size) {
                                Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                                return i
                                  .editReply({
                                    embeds: [
                                      embed(`**Levels**
                                            ❌ The number is higher than the amount of rewards!`),
                                    ],
                                  })
                                  .then((msg) => {
                                    setTimeout(() => {
                                      levelsMenu(i);
                                    }, 3000);
                                  });
                              }
                              if (rewardNumber < 0) {
                                Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                                return i
                                  .editReply({
                                    embeds: [
                                      embed(`**Levels**
                                            ❌ The number is lower than zero!`),
                                    ],
                                  })
                                  .then((msg) => {
                                    setTimeout(() => {
                                      levelsMenu(i);
                                    }, 3000);
                                  });
                              }

                              rewardNumber = Number(rewardNumber) - 1;

                              i.editReply({
                                embeds: [
                                  embed(`**Levels**
                                          ✅ Succesfully removed the reward that gave ${msg.guild.roles.cache.find(
                                            (c) =>
                                              c.id ===
                                              levels.rewards[rewardNumber]
                                                .rewardID
                                          )} on level **${
                                    levels.rewards[rewardNumber].level
                                  }**!`),
                                ],
                                components: [],
                              });
                              setTimeout(() => {
                                levelsMenu(i);
                              }, 3000);

                              guild.addons.levels.rewards.splice(
                                rewardNumber,
                                1
                              );
                              await Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                              return guild.save().catch((err) => {
                                Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                                i.editReply({
                                  embeds: [
                                    embed(`**Dashboard**
                                              ❌ I couldn't save the settings.
                                              
                                              **Error Message**
                                              > ${err.stack}`),
                                  ],
                                  components: [],
                                });
                                setTimeout(() => {
                                  levelsMenu(i);
                                }, 3000);
                              });
                            });
                          });
                        });
                      }
                    });
                  });
                }
              });
            }
            levelsMenu(i);
          }
          if (i.customId === "memberLogsButton") {
            const settingsRow = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId("toggleMemberLogsButton")
                .setLabel("Toggle Member-Logs")
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId("editJoinroleButton")
                .setLabel("Edit Join Role")
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId("editChannelButton")
                .setLabel("Edit member-log channel")
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId("editJoinButtonBuilder")
                .setLabel("Edit Join Message")
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId("editLeaveButtonBuilder")
                .setLabel("Edit Leave Message")
                .setStyle(ButtonStyle.Primary)
            );

            const backRow = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId("settingsBack")
                .setLabel("Go back")
                .setStyle(ButtonStyle.Danger)
            );

            async function memberLogsMenu(i) {
              if (i.replied) {
                i.editReply({
                  embeds: [
                    embed(`**Member-Logs**
                              Enabled - ${memberLogs.enabled ? "✅" : "❌"}
  
                              Log-channel - ${
                                msg.guild.channels.cache.find(
                                  (c) => c.id === memberLogs.channel
                                )
                                  ? msg.guild.channels.cache.find(
                                      (c) => c.id === memberLogs.channel
                                    )
                                  : "None"
                              }
  
                              Join message
                              > ${memberLogs.messages.join}
  
                              Leave Message
                              > ${memberLogs.messages.leave}
  
                              Join Role - ${
                                msg.guild.roles.cache.find(
                                  (c) => c.id === memberLogs.joinRole
                                )
                                  ? msg.guild.roles.cache.find(
                                      (c) => c.id === memberLogs.joinRole
                                    )
                                  : "None"
                              }`),
                  ],
                  components: [settingsRow, backRow],
                });
              } else {
                i.update({
                  embeds: [
                    embed(`**Member-Logs**
                              Enabled - ${memberLogs.enabled ? "✅" : "❌"}
  
                              Log-channel - ${
                                msg.guild.channels.cache.find(
                                  (c) => c.id === memberLogs.channel
                                )
                                  ? msg.guild.channels.cache.find(
                                      (c) => c.id === memberLogs.channel
                                    )
                                  : "None"
                              }
  
                              Join message
                              > ${memberLogs.messages.join}
  
                              Leave Message
                              > ${memberLogs.messages.leave}
  
                              Join Role - ${
                                msg.guild.roles.cache.find(
                                  (c) => c.id === memberLogs.joinRole
                                )
                                  ? msg.guild.roles.cache.find(
                                      (c) => c.id === memberLogs.joinRole
                                    )
                                  : "None"
                              }`),
                  ],
                  components: [settingsRow, backRow],
                });
              }

              const collector =
                interaction.channel.createMessageComponentCollector({
                  buttonFilter,
                  time: 30000,
                  max: 1,
                });
              collector.on("collect", async (i) => {
                if (i.customId === "settingsBack") return mainMenu(i);

                if (i.customId === "toggleMemberLogsButton") {
                  memberLogs.enabled = !memberLogs.enabled;

                  return guild
                    .save()
                    .then(() => {
                      i.update({
                        embeds: [
                          embed(`**Member-Logs**
                                ✅ The member-logs module has been **${
                                  memberLogs.enabled ? "enabled" : "disabled"
                                }**`),
                        ],
                        components: [],
                      });
                      setTimeout(() => {
                        memberLogsMenu(i);
                      }, 3000);
                    })
                    .catch((err) => {
                      i.update({
                        embeds: [
                          embed(`**Dashboard**
                                  ❌ I couldn't save the settings.
                                  
                                  **Error Message**
                                  > ${err.stack}`),
                        ],
                        components: [],
                      });
                    });
                }

                if (i.customId === "editJoinButtonBuilder") {
                  i.update({
                    embeds: [
                      embed(`**Member-Logs**
                                Current Join message
                                ${memberLogs.messages.join}

                                **Use [GUILD] for the guild-name, [COUNT] for the member-count and [USER] for the user**
                                
                                Please write the new join message in the chat.`),
                    ],
                    components: [],
                  }).then((msg) => {
                    interaction.fetchReply().then(async (msg) => {
                      Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,true)

                      var msgCollector = msg.channel.createMessageCollector({
                        msgFilter,
                        max: 1,
                      });

                      msgCollector.on("collect", async (collected) => {
                        collected.delete();

                        let joinMessage = collected.content;

                        memberLogs.messages.join = joinMessage;

                        return guild
                          .save()
                          .then(() => {
                            Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                            i.editReply({
                              embeds: [
                                embed(`**Member-Logs**
                                    ✅ The join message has been changed to
                                    ${joinMessage}`),
                              ],
                              components: [],
                            });
                            setTimeout(() => {
                              memberLogsMenu(i);
                            }, 3000);
                          })
                          .catch((err) => {
                            i.editReply({
                              embeds: [
                                embed(`**Dashboard**
                                      ❌ I couldn't save the settings.
                                      
                                      **Error Message**
                                      > ${err.stack}`),
                              ],
                              components: [],
                            });
                            setTimeout(() => {
                              memberLogsMenu(i);
                            }, 3000);
                          });
                      });
                    });
                  });
                }

                if (i.customId === "editLeaveButtonBuilder") {
                  i.update({
                    embeds: [
                      embed(`**Member-Logs**
                                Current Leave message
                                ${memberLogs.messages.leave}

                                **Use [GUILD] for the guild-name, [COUNT] for the member-count and [USER] for the user**
                                
                                Please write the new leave message in the chat.`),
                    ],
                    components: [],
                  }).then((msg) => {
                    interaction.fetchReply().then(async (msg) => {
                      Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,true)

                      var msgCollector = msg.channel.createMessageCollector({
                        msgFilter,
                        max: 1,
                      });

                      msgCollector.on("collect", async (collected) => {
                        collected.delete();

                        let leaveMessage = collected.content;

                        memberLogs.messages.leave = leaveMessage;

                        return guild
                          .save()
                          .then(() => {
                            Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)

                            i.editReply({
                              embeds: [
                                embed(`**Member-Logs**
                                    ✅ The leave message has been changed to
                                    ${leaveMessage}`),
                              ],
                              components: [],
                            });
                            setTimeout(() => {
                              memberLogsMenu(i);
                            }, 3000);
                          })
                          .catch((err) => {
                            i.editReply({
                              embeds: [
                                embed(`**Dashboard**
                                      ❌ I couldn't save the settings.
                                      
                                      **Error Message**
                                      > ${err.stack}`),
                              ],
                              components: [],
                            });
                            setTimeout(() => {
                              memberLogsMenu(i);
                            }, 3000);
                          });
                      });
                    });
                  });
                }

                if (i.customId === "editJoinroleButton") {
                  i.update({
                    embeds: [
                      embed(`**Member-Logs**
                                Current join role: ${
                                  msg.guild.roles.cache.find(
                                    (c) => c.id === memberLogs.joinRole
                                  )
                                    ? msg.guild.roles.cache.find(
                                        (c) => c.id === memberLogs.joinRole
                                      )
                                    : "None"
                                }
                                
                                What do you want to change it to?`),
                    ],
                    components: [],
                  }).then((msg) => {
                    interaction.fetchReply().then(async (msg) => {
                      Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,true)

                      var msgCollector = msg.channel.createMessageCollector({
                        msgFilter,
                        max: 1,
                      });

                      msgCollector.on("collect", async (collected) => {
                        collected.delete();

                        let joinRole = collected.content;

                        if (roleRegex.test(joinRole)) {
                          joinRole = msg.guild.roles.cache.find(
                            (c) => c.id === roleRegex.exec(joinRole)[1]
                          );
                        } else {
                          joinRole = msg.guild.roles.cache.find(
                            (c) => c.id === joinRole || c.name === joinRole
                          );
                        }

                        if (!joinRole) {
                          Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                          i.editReply({
                            embeds: [
                              embed(`**Member-Logs**
                                        ❌ That is not a valid role!`),
                            ],
                          });
                          return setTimeout(() => {
                            memberLogsMenu(i);
                          }, 3000);
                        }

                        memberLogs.joinRole = joinRole.id;

                        return guild
                          .save()
                          .then(() => {
                            Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                            i.editReply({
                              embeds: [
                                embed(`**Member-Logs**
                                      ✅ Successfully set the Join Role to ${joinRole}!`),
                              ],
                            });
                            setTimeout(() => {
                              memberLogsMenu(i);
                            }, 3000);
                          })
                          .catch((err) => {
                            Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)

                            i.editReply({
                              embeds: [
                                embed(`**Dashboard**
                                        ❌ I couldn't save the settings.
                                        
                                        **Error Message**
                                        > ${err.stack}`),
                              ],
                              components: [],
                            });

                            setTimeout(() => {
                              memberLogsMenu(i);
                            }, 3000);
                          });
                      });
                    });
                  });
                }

                if (i.customId === "editChannelButton") {
                  i.update({
                    embeds: [
                      embed(`**Member-Logs**
                                    Please write the name or the id of the channel in the chat.`),
                    ],
                    components: [],
                  }).then((int) => {
                    interaction.fetchReply().then(async (msg) => {
                      Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,true)

                      var msgCollector = msg.channel.createMessageCollector({
                        msgFilter,
                        max: 1,
                      });

                      msgCollector.on("collect", async (collected) => {
                        collected.delete();

                        let channel;

                        if (channelRegex.test(collected.content) === true) {
                          channel = interaction.guild.channels.cache.find(
                            (c) =>
                              c.id === channelRegex.exec(collected.content)[1]
                          );
                        } else {
                          channel = interaction.guild.channels.cache.find(
                            (c) =>
                              c.id === collected.content ||
                              c.name === collected.content
                          );
                        }

                        if (!channel) {
                          return i
                            .editReply({
                              embeds: [
                                embed(`**Member-Logs**
                                      ❌ That is not a valid channel!`),
                              ],
                              components: [],
                            })
                            .then((msg) => {
                              Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                              setTimeout(() => {
                                memberLogsMenu(i);
                              }, 3000);
                            });
                        }

                        memberLogs.channel = channel.id;

                        channel
                          .send({
                            embeds: [
                              embed(`**Member-Logs**
                                ✅ This is now the new logging channel!`),
                            ],
                          })
                          .then(async (msg) => {
                            
                            setTimeout(() => {
                              msg.delete();
                            }, 4000);
                          });

                        return guild
                          .save()
                          .then(() => {
                            Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                            i.editReply({
                              embeds: [
                                embed(`**Member-Logs**
                                    ✅ Successfully set the logging channel to <#${channel.id}>!`),
                              ],
                              components: [],
                            });
                            setTimeout(() => {
                              memberLogsMenu(i);
                            }, 3000);
                          })
                          .catch((err) => {
                            Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                            i.editReply({
                              embeds: [
                                embed(`**Dashboard**
                                  ❌ I couldn't save the settings.
                                  
                                  **Error Message**
                                  > ${err.stack}`),
                              ],
                              components: [],
                            });
                            setTimeout(() => {
                              memberLogsMenu(i);
                            }, 3000);
                          });
                      });
                    });
                  });
                }
              });
            }
            memberLogsMenu(i);
          }
          if (i.customId === "autoModButton") {
            const settingsRow = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId("noSwearButton")
                .setLabel("No-Swear Settings")
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId("noLinksButton")
                .setLabel("No-Links Settings")
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId("noCapsButton")
                .setLabel("Toggle No-Caps")
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId("noSpamButton")
                .setLabel("Toggle No-Spam")
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId("exceptionsButton")
                .setLabel("Exceptions")
                .setStyle(ButtonStyle.Primary)
            );
            const backMenu = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId("settingsBack")
                .setLabel("Go back")
                .setStyle(ButtonStyle.Danger)
            );
            async function autoModMenu(i) {
              if (i.replied) {
                i.editReply({
                  embeds: [
                    embed(`**Automod**
                                  **Anti-Swear**
                                  > Enabled - ${automod.noSwear ? "✅" : "❌"} 
      
                                  **Anti-Links**
                                  > Enabled - ${automod.noLinks ? "✅" : "❌"}
      
                                  **Anti-Caps**
                                  > Enabled - ${automod.noCaps ? "✅" : "❌"} 
      
                                  **Anti-Spam**
                                  > Enabled - ${automod.noSpam ? "✅" : "❌"}`),
                  ],
                  components: [settingsRow, backMenu],
                });
              } else {
                i.update({
                  embeds: [
                    embed(`**Automod**
                                  **Anti-Swear**
                                  > Enabled - ${automod.noSwear ? "✅" : "❌"} 
      
                                  **Anti-Links**
                                  > Enabled - ${automod.noLinks ? "✅" : "❌"}
      
                                  **Anti-Caps**
                                  > Enabled - ${automod.noCaps ? "✅" : "❌"} 
      
                                  **Anti-Spam**
                                  > Enabled - ${automod.noSpam ? "✅" : "❌"}`),
                  ],
                  components: [settingsRow, backMenu],
                });
              }

              const collector =
                interaction.channel.createMessageComponentCollector({
                  buttonFilter,
                  time: 30000,
                  max: 1,
                });
              collector.on("collect", async (i) => {
                if (i.customId === "settingsBack") mainMenu(i);

                if (i.customId === "noSwearButton") {
                  async function noSwearMenu(i) {
                    const settingsRowSwear =
                      new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                          .setCustomId("togglenoSwearButton")
                          .setLabel("Toggle Anti-Swear")
                          .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                          .setCustomId("exceptionsButton")
                          .setLabel("Exceptions")
                          .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                          .setCustomId("goBackButton")
                          .setLabel("Go Back")
                          .setStyle(ButtonStyle.Danger)
                      );

                    if (i.replied) {
                      i.editReply({
                        embeds: [
                          embed(`**Anti-Swear**
                                          Enabled - ${
                                            automod.noSwear ? "✅" : "❌"
                                          }
                                          
                                          **Exceptions**
                                          ${
                                            automod.exempt.words.length > 0
                                              ? automod.exempt.words.join(", ")
                                              : "None.\nAdd more by using the exceptions button down below"
                                          }`),
                        ],
                        components: [settingsRowSwear],
                      });
                    } else {
                      i.update({
                        embeds: [
                          embed(`**Anti-Swear**
                                          Enabled - ${
                                            automod.noSwear ? "✅" : "❌"
                                          }
                                          
                                          **Exceptions**
                                          ${
                                            automod.exempt.words.length > 0
                                              ? automod.exempt.words.join(", ")
                                              : "None.\nAdd more by using the exceptions button down below"
                                          }`),
                        ],
                        components: [settingsRowSwear],
                      });
                    }
                    const collector =
                      interaction.channel.createMessageComponentCollector({
                        buttonFilter,
                        time: 30000,
                        max: 1,
                      });
                    collector.on("collect", async (i) => {
                      if (i.customId === "goBackButton") return autoModMenu(i);

                      if (i.customId === "togglenoSwearButton") {
                        automod.noSwear = !automod.noSwear;

                        return guild
                          .save()
                          .then(() => {
                            i.update({
                              embeds: [
                                embed(`**Anti-Swear**
                                                ✅ The Anti-Swear module has been **${
                                                  automod.noSwear
                                                    ? "enabled"
                                                    : "disabled"
                                                }**`),
                              ],
                              components: [],
                            });
                            setTimeout(() => {
                              return noSwearMenu(i);
                            }, 3000);
                          })
                          .catch((err) => {
                            i.update({
                              embeds: [
                                embed(`**Dashboard**
                                                  ❌ I couldn't save the settings.
                                                  
                                                  **Error Message**
                                                  > ${err.stack}`),
                              ],
                              components: [],
                            });
                          });
                      }

                      if (i.customId === "exceptionsButton") {
                        const settingsRow =
                          new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                              .setCustomId("addExeptionButton")
                              .setLabel("Add word")
                              .setStyle(ButtonStyle.Primary),
                            new ButtonBuilder()
                              .setCustomId("remExeptionButton")
                              .setLabel("Remove word")
                              .setStyle(ButtonStyle.Primary),
                            new ButtonBuilder()
                              .setCustomId("backButton")
                              .setLabel("Go Back")
                              .setStyle(ButtonStyle.Danger)
                          );

                        i.update({
                          embeds: [
                            embed(`**Anti-Swear**
                                              **Exceptions**
                                              ${
                                                automod.exempt.words.length > 0
                                                  ? automod.exempt.words.join(
                                                      ", "
                                                    )
                                                  : "None.\nAdd more by using the exceptions button down below"
                                              }`),
                          ],
                          components: [settingsRow],
                        });

                        const collector =
                          interaction.channel.createMessageComponentCollector({
                            buttonFilter,
                            time: 30000,
                            max: 1,
                          });
                        collector.on("collect", async (i) => {
                          if (i.customId === "backButton")
                            return noSwearMenu(i);

                          if (i.customId === "addExeptionButton") {
                            i.update({
                              embeds: [
                                embed(`**Anti-Swear**
                                                  Please write the word you want to add to the exceptions list.`),
                              ],
                              components: [],
                            });

                            interaction.fetchReply().then(async (msg) => {
                              Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,true)

                              var msgCollector =
                                msg.channel.createMessageCollector({
                                  msgFilter,
                                  max: 1,
                                });

                              msgCollector.on("collect", async (collected) => {
                                collected.delete();

                                let word = collected.content.split(" ")[0];

                                automod.exempt.words.push(word);

                                guild.markModified(
                                  "addons.automod.exempt.words"
                                );

                                guild
                                  .save()
                                  .then(() => {
                                    Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                                    i.editReply({
                                      embeds: [
                                        embed(`**Anti-Swear**
                                                    ✅ Successfully added \`${word}\` to the word-list!`),
                                      ],
                                      components: [],
                                    });
                                    setTimeout(() => {
                                      return noSwearMenu(i);
                                    }, 3000);
                                  })
                                  .catch((err) => {
                                    Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                                    i.editReply({
                                      embeds: [
                                        embed(`**Dashboard**
                                                      ❌ I couldn't save the settings.
                                                      
                                                      **Error Message**
                                                      > ${err.stack}`),
                                      ],
                                      components: [],
                                    });
                                  });
                              });
                            });
                          }

                          if (i.customId === "remExeptionButton") {
                            i.update({
                              embeds: [
                                embed(`**Anti-Swear**
                                                  Please write the word you want to remove from the exceptions list.`),
                              ],
                              components: [],
                            });

                            interaction.fetchReply().then(async (msg) => {
                              Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,true)

                              var msgCollector =
                                msg.channel.createMessageCollector({
                                  msgFilter,
                                  max: 1,
                                });

                              msgCollector.on("collect", async (collected) => {
                                collected.delete();

                                let word = collected.content.split(" ")[0];

                                for (var x in automod.exempt.words) {
                                  if (automod.exempt.words[x] === word) {
                                    automod.exempt.words.splice(x, 1);
                                  }
                                }

                                guild.markModified(
                                  "addons.automod.exempt.words"
                                );

                                guild
                                  .save()
                                  .then(() => {
                                    Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                                    i.editReply({
                                      embeds: [
                                        embed(`**Anti-Swear**
                                                    ✅ Successfully removed \`${word}\` from the word-list!`),
                                      ],
                                      components: [],
                                    });
                                    setTimeout(() => {
                                      return noSwearMenu(i);
                                    }, 3000);
                                  })
                                  .catch((err) => {
                                    Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                                    i.editReply({
                                      embeds: [
                                        embed(`**Dashboard**
                                                      ❌ I couldn't save the settings.
                                                      
                                                      **Error Message**
                                                      > ${err.stack}`),
                                      ],
                                      components: [],
                                    });
                                  });
                              });
                            });
                          }
                        });
                      }
                    });
                  }
                  noSwearMenu(i);
                }
                if (i.customId === "noLinksButton") {
                  const settingsRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                      .setCustomId("togglenoLinksButton")
                      .setLabel("Toggle Anti-Links")
                      .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                      .setCustomId("exceptionsButton")
                      .setLabel("Exceptions")
                      .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                      .setCustomId("backButton")
                      .setLabel("Go Back")
                      .setStyle(ButtonStyle.Danger)
                  );

                  async function antiLinks(i) {
                    if (i.replied) {
                      i.editReply({
                        embeds: [
                          embed(`**Anti-Links**
                                                  Enabled - ${
                                                    automod.noLinks
                                                      ? "✅"
                                                      : "❌"
                                                  }
                                                  
                                                  **Exceptions**
                                                  ${
                                                    automod.exempt.links.size >
                                                    0
                                                      ? automod.exempt.links.join(
                                                          ", "
                                                        )
                                                      : "None.\nAdd more by using the exceptions button down below"
                                                  }`),
                        ],
                        components: [settingsRow],
                      });
                    } else {
                      i.update({
                        embeds: [
                          embed(`**Anti-Links**
                                                  Enabled - ${
                                                    automod.noLinks
                                                      ? "✅"
                                                      : "❌"
                                                  }
                                                  
                                                  **Exceptions**
                                                  ${
                                                    automod.exempt.links
                                                      .length > 0
                                                      ? automod.exempt.links.join(
                                                          ", "
                                                        )
                                                      : "None.\nAdd more by using the exceptions button down below"
                                                  }`),
                        ],
                        components: [settingsRow],
                      });
                    }

                    const collector =
                      interaction.channel.createMessageComponentCollector({
                        buttonFilter,
                        time: 30000,
                        max: 1,
                      });
                    collector.on("collect", async (i) => {
                      if (i.customId === "backButton") return autoModMenu(i);

                      if (i.customId === "togglenoLinksButton") {
                        automod.noLinks = !automod.noLinks;

                        return guild
                          .save()
                          .then(() => {
                            i.update({
                              embeds: [
                                embed(`**Anti-Links**
                                                          ✅ The Anti-Links module has been **${
                                                            automod.noLinks
                                                              ? "enabled"
                                                              : "disabled"
                                                          }**`),
                              ],
                              components: [],
                            });
                            setTimeout(() => {
                              return antiLinks(i);
                            }, 3000);
                          })
                          .catch((err) => {
                            i.update({
                              embeds: [
                                embed(`**Dashboard**
                                                            ❌ I couldn't save the settings.
                                                            
                                                            **Error Message**
                                                            > ${err.stack}`),
                              ],
                              components: [],
                            });
                          });
                      }

                      if (i.customId === "exceptionsButton") {
                        const settingsRow =
                          new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                              .setCustomId("addExeptionButton")
                              .setLabel("Add word")
                              .setStyle(ButtonStyle.Primary),
                            new ButtonBuilder()
                              .setCustomId("remExeptionButton")
                              .setLabel("Remove word")
                              .setStyle(ButtonStyle.Primary),
                            new ButtonBuilder()
                              .setCustomId("backButton")
                              .setLabel("Go back")
                              .setStyle(ButtonStyle.Danger)
                          );

                        i.update({
                          embeds: [
                            embed(`**Anti-Links**
                                                        **Exceptions**
                                                        ${
                                                          automod.exempt.links
                                                            .length > 0
                                                            ? automod.exempt.links.join(
                                                                ", "
                                                              )
                                                            : "None.\nAdd more by using the exceptions button down below"
                                                        }`),
                          ],
                          components: [settingsRow],
                        });

                        const collector =
                          interaction.channel.createMessageComponentCollector({
                            buttonFilter,
                            time: 30000,
                            max: 1,
                          });
                        collector.on("collect", async (i) => {
                          if (i.customId === "backButton") return antiLinks(i);

                          if (i.customId === "addExeptionButton") {
                            i.update({
                              embeds: [
                                embed(`**Anti-Links**
                                                            Please write the URI you want to add to the exceptions list.`),
                              ],
                              components: [],
                            });

                            interaction.fetchReply().then(async (msg) => {
                              Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,true)

                              var msgCollector =
                                msg.channel.createMessageCollector({
                                  msgFilter,
                                  max: 1,
                                });

                              msgCollector.on("collect", async (collected) => {
                                collected.delete();

                                let link = collected.content.split(" ")[0];

                                automod.exempt.links.push(link);

                                guild.markModified(
                                  "addons.automod.exempt.links"
                                );

                                guild
                                  .save()
                                  .then(() => {
                                    Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                                    i.editReply({
                                      embeds: [
                                        embed(`**Anti-Links**
                                                              ✅ Successfully added \`${link}\` to the URI-list!`),
                                      ],
                                      components: [],
                                    });
                                    setTimeout(() => {
                                      return antiLinks(i);
                                    }, 3000);
                                  })
                                  .catch((err) => {
                                    Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)

                                    i.editReply({
                                      embeds: [
                                        embed(`**Dashboard**
                                                                ❌ I couldn't save the settings.
                                                                
                                                                **Error Message**
                                                                > ${err.stack}`),
                                      ],
                                      components: [],
                                    });
                                  });
                              });
                            });
                          }

                          if (i.customId === "remExeptionButton") {
                            i.update({
                              embeds: [
                                embed(`**Anti-Links**
                                                            Please write the URI you want to remove from the exceptions list.`),
                              ],
                              components: [],
                            });

                            interaction.fetchReply().then(async (msg) => {
                              Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,true)

                              var msgCollector =
                                msg.channel.createMessageCollector({
                                  msgFilter,
                                  max: 1,
                                });

                              msgCollector.on("collect", async (collected) => {
                                collected.delete();

                                let link = collected.content.split(" ")[0];

                                for (var x in automod.exempt.links) {
                                  if (automod.exempt.links[x] === link) {
                                    automod.exempt.links.splice(x, 1);
                                  }
                                }

                                guild.markModified(
                                  "addons.automod.exempt.links"
                                );

                                guild
                                  .save()
                                  .then(() => {
                                                              Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                                    i.editReply({
                                      embeds: [
                                        embed(`**Anti-Links**
                                                              ✅ Successfully removed \`${link}\` from the URI-list!`),
                                      ],
                                      components: [],
                                    });
                                    setTimeout(() => {
                                      return antiLinks(i);
                                    }, 3000);
                                  })
                                  .catch((err) => {
                                    Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)

                                    i.editReply({
                                      embeds: [
                                        embed(`**Dashboard**
                                                                ❌ I couldn't save the settings.
                                                                
                                                                **Error Message**
                                                                > ${err.stack}`),
                                      ],
                                      components: [],
                                    });
                                  });
                              });
                            });
                          }
                        });
                      }
                    });
                  }
                  antiLinks(i);
                }
                if (i.customId === "noSpamButton") {
                  automod.noSpam = !automod.noSpam;

                  return guild
                    .save()
                    .then(() => {
                      i.update({
                        embeds: [
                          embed(`**No-Spam**
                                        ✅ The No-Spam module has been **${
                                          automod.noSpam
                                            ? "enabled"
                                            : "disabled"
                                        }**`),
                        ],
                        components: [],
                      });
                      setTimeout(() => {
                        autoModMenu(i);
                      }, 3000);
                    })
                    .catch((err) => {
                      i.update({
                        embeds: [
                          embed(`**Dashboard**
                                          ❌ I couldn't save the settings.
                                          
                                          **Error Message**
                                          > ${err.stack}`),
                        ],
                        components: [],
                      });
                    });
                }
                if (i.customId === "noCapsButton") {
                  automod.noCaps = !automod.noCaps;

                  return guild
                    .save()
                    .then(() => {
                      i.update({
                        embeds: [
                          embed(`**No-Caps**
                                        ✅ The No-Caps module has been **${
                                          automod.noCaps
                                            ? "enabled"
                                            : "disabled"
                                        }**`),
                        ],
                        components: [],
                      });
                      setTimeout(() => {
                        autoModMenu(i);
                      }, 3000);
                    })
                    .catch((err) => {
                      i.update({
                        embeds: [
                          embed(`**Dashboard**
                                          ❌ I couldn't save the settings.
                                          
                                          **Error Message**
                                          > ${err.stack}`),
                        ],
                        components: [],
                      });
                    });
                }
                if (i.customId === "exceptionsButton") {
                  const settingsRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                      .setCustomId("rolesExemptButton")
                      .setLabel("Roles Exceptions")
                      .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                      .setCustomId("usersExemptButton")
                      .setLabel("User Exceptions")
                      .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                      .setCustomId("backButton")
                      .setLabel("Go Back")
                      .setStyle(ButtonStyle.Danger)
                  );

                  let roles = [];
                  for (var a in automod.exempt.roles) {
                    let role = interaction.guild.roles.cache.find(
                      (c) => c.id === automod.exempt.roles[a]
                    );
                    if (role) roles.push(role.name);
                  }

                  let users = [];
                  for (var a in automod.exempt.users) {
                    let member = interaction.guild.members.cache.find(
                      (c) => c.id === automod.exempt.users[a]
                    );
                    if (member)
                      users.push(
                        member.user.username + "#" + member.user.discriminator
                      );
                  }

                  async function exeptionsMenu(i) {
                    if (i.replied) {
                      i.editReply({
                        embeds: [
                          embed(`**Automod - Exceptions**
                                        **Users**
                                        > ${
                                          automod.exempt.users.length > 0
                                            ? users.join(", ")
                                            : "None. "
                                        } 
            
                                        **Roles**
                                        > ${
                                          automod.exempt.roles.length > 0
                                            ? roles.join(", ")
                                            : "None."
                                        } `),
                        ],
                        components: [settingsRow],
                      });
                    } else {
                      i.update({
                        embeds: [
                          embed(`**Automod - Exceptions**
                                        **Users**
                                        > ${
                                          automod.exempt.users.length > 0
                                            ? users.join(", ")
                                            : "None. "
                                        } 
            
                                        **Roles**
                                        > ${
                                          automod.exempt.roles.length > 0
                                            ? roles.join(", ")
                                            : "None."
                                        } `),
                        ],
                        components: [settingsRow],
                      });
                    }

                    const collector =
                      interaction.channel.createMessageComponentCollector({
                        buttonFilter,
                        time: 30000,
                        max: 1,
                      });
                    collector.on("collect", async (i) => {
                      if (i.customId === "backButton") return autoModMenu(i);

                      if (i.customId === "rolesExemptButton") {
                        const settingsRow =
                          new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                              .setCustomId("addExeptionButton")
                              .setLabel("Add role")
                              .setStyle(ButtonStyle.Primary),
                            new ButtonBuilder()
                              .setCustomId("remExeptionButton")
                              .setLabel("Remove role")
                              .setStyle(ButtonStyle.Primary),
                            new ButtonBuilder()
                              .setCustomId("backButton")
                              .setLabel("Go Back")
                              .setStyle(ButtonStyle.Danger)
                          );

                        async function roleExemptMenu(i) {
                          if (i.replied) {
                            i.editReply({
                              embeds: [
                                embed(`**Automod - Role Exceptions**
                                                      **Exceptions**
                                                      ${
                                                        roles.length > 0
                                                          ? roles.join(", ")
                                                          : "None.\nAdd more by using the add exceptions button down below"
                                                      }`),
                              ],
                              components: [settingsRow],
                            });
                          } else {
                            i.update({
                              embeds: [
                                embed(`**Automod - Role Exceptions**
                                                      **Exceptions**
                                                      ${
                                                        roles.length > 0
                                                          ? roles.join(", ")
                                                          : "None.\nAdd more by using the add exceptions button down below"
                                                      }`),
                              ],
                              components: [settingsRow],
                            });
                          }

                          const collector =
                            interaction.channel.createMessageComponentCollector(
                              { buttonFilter, time: 30000, max: 1 }
                            );
                          collector.on("collect", async (i) => {
                            if (i.customId === "backButton") exeptionsMenu(i);

                            if (i.customId === "addExeptionButton") {
                              i.update({
                                embeds: [
                                  embed(`**Automod - Role Exceptions**
                                                        Please tag the role you want to add to the exceptions list.`),
                                ],
                                components: [],
                              });

                              interaction.fetchReply().then(async (msg) => {
                                Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,true)

                                var msgCollector =
                                  msg.channel.createMessageCollector({
                                    msgFilter,
                                    max: 1,
                                  });

                                msgCollector.on(
                                  "collect",
                                  async (collected) => {
                                    collected.delete();

                                    let exceptionRole = collected.content;

                                    if (roleRegex.test(exceptionRole)) {
                                      exceptionRole =
                                        msg.guild.roles.cache.find(
                                          (c) =>
                                            c.id ===
                                            roleRegex.exec(exceptionRole)[1]
                                        );
                                    } else {
                                      exceptionRole =
                                        msg.guild.roles.cache.find(
                                          (c) =>
                                            c.id === exceptionRole ||
                                            c.name === exceptionRole
                                        );
                                    }

                                    if (!exceptionRole) {
                                      
                                      return i
                                        .editReply({
                                          embeds: [
                                            embed(`**Automod - Role Exceptions**
                                                            ❌ I could not find that role!`),
                                          ],
                                          components: [],
                                        })
                                        .then((msg) => {
                                          Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                                          setTimeout(() => {
                                            roleExemptMenu(i);
                                          }, 3000);
                                        });
                                    }

                                    automod.exempt.roles.push(exceptionRole.id);

                                    guild.markModified(
                                      "addons.automod.exempt.roles"
                                    );

                                    guild
                                      .save()
                                      .then(() => {
                                        Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)

                                        i.editReply({
                                          embeds: [
                                            embed(`**Automod - Role Exceptions**
                                                          ✅ Successfully added ${exceptionRole} to the roles-list!`),
                                          ],
                                          components: [],
                                        });
                                        setTimeout(
                                          () => roleExemptMenu(i),
                                          1000
                                        );
                                      })
                                      .catch((err) => {
                                        Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)

                                        i.editReply({
                                          embeds: [
                                            embed(`**Dashboard**
                                                            ❌ I couldn't save the settings.
                                                            
                                                            **Error Message**
                                                            > ${err.stack}`),
                                          ],
                                          components: [],
                                        });
                                      });
                                  }
                                );
                              });
                            }

                            if (i.customId === "remExeptionButton") {
                              i.update({
                                embeds: [
                                  embed(`**Automod - Role Exceptions**
                                                        Please write the role you want to remove from the exceptions list.`),
                                ],
                                components: [],
                              });

                              interaction.fetchReply().then(async (msg) => {
                                Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,true)

                                var msgCollector =
                                  msg.channel.createMessageCollector({
                                    msgFilter,
                                    max: 1,
                                  });

                                msgCollector.on(
                                  "collect",
                                  async (collected) => {
                                    collected.delete();

                                    let exceptionRole = collected.content;

                                    if (roleRegex.test(exceptionRole)) {
                                      exceptionRole =
                                        msg.guild.roles.cache.find(
                                          (c) =>
                                            c.id ===
                                            roleRegex.exec(exceptionRole)[1]
                                        );
                                    } else {
                                      exceptionRole =
                                        msg.guild.roles.cache.find(
                                          (c) =>
                                            c.id === exceptionRole ||
                                            c.name === exceptionRole
                                        );
                                    }

                                    if (!exceptionRole) {
                                      return i
                                        .editReply({
                                          embeds: [
                                            embed(`**Automod - Role Exceptions**
                                                            ❌ I could not find that role!`),
                                          ],
                                          components: [],
                                        })
                                        .then((msg) => {
                                          Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)

                                          setTimeout(() => {
                                            roleExemptMenu(i);
                                          }, 3000);
                                        });
                                    }

                                    if (
                                      !automod.exempt.roles.includes(
                                        exceptionRole.id
                                      )
                                    ) {
                                      return i
                                        .editReply({
                                          embeds: [
                                            embed(`**Automod - Role Exceptions**
                                                            ❌ That role is not on the exempt list!`),
                                          ],
                                          components: [],
                                        })
                                        .then((msg) => {
                                          Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)

                                          setTimeout(() => {
                                            roleExemptMenu(i);
                                          }, 3000);
                                        });
                                    }

                                    for (var i in automod.exempt.roles) {
                                      if (
                                        automod.exempt.roles[i] ===
                                        exceptionRole.id
                                      ) {
                                        automod.exempt.roles.splice(i, 1);
                                      }
                                    }

                                    guild.markModified(
                                      "addons.automod.exempt.roles"
                                    );

                                    guild
                                      .save()
                                      .then(() => {
                                                                  Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)

                                        i.editReply({
                                          embeds: [
                                            embed(`**Automod - Role Exceptions**
                                                          ✅ Successfully removed ${exceptionRole} from the role-list!`),
                                          ],
                                          components: [],
                                        });
                                        setTimeout(
                                          () => roleExemptMenu(i),
                                          1000
                                        );
                                      })
                                      .catch((err) => {
                                        Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)

                                        i.editReply({
                                          embeds: [
                                            embed(`**Dashboard**
                                                            ❌ I couldn't save the settings.
                                                            
                                                            **Error Message**
                                                            > ${err.stack}`),
                                          ],
                                          components: [],
                                        });
                                      });
                                  }
                                );
                              });
                            }
                          });
                        }
                        roleExemptMenu(i);
                      }

                      if (i.customId === "usersExemptButton") {
                        const settingsRow =
                          new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                              .setCustomId("addExeptionButton")
                              .setLabel("Add user")
                              .setStyle(ButtonStyle.Primary),
                            new ButtonBuilder()
                              .setCustomId("remExeptionButton")
                              .setLabel("Remove user")
                              .setStyle(ButtonStyle.Primary),
                            new ButtonBuilder()
                              .setCustomId("backButton")
                              .setLabel("Go Back")
                              .setStyle(ButtonStyle.Danger)
                          );

                        async function userExemptMenu(i) {
                          if (i.replied) {
                            i.editReply({
                              embeds: [
                                embed(`**Automod - User Exceptions**
                                                    **Exceptions**
                                                    ${
                                                      users.length > 0
                                                        ? users.join(", ")
                                                        : "None.\nAdd more by using the add exceptions button down below"
                                                    }`),
                              ],
                              components: [settingsRow],
                            });
                          } else {
                            i.update({
                              embeds: [
                                embed(`**Automod - User Exceptions**
                                                    **Exceptions**
                                                    ${
                                                      users.length > 0
                                                        ? users.join(", ")
                                                        : "None.\nAdd more by using the add exceptions button down below"
                                                    }`),
                              ],
                              components: [settingsRow],
                            });
                          }

                          const collector =
                            interaction.channel.createMessageComponentCollector(
                              { buttonFilter, time: 30000, max: 1 }
                            );
                          collector.on("collect", async (i) => {
                            if (i.customId === "backButton") exeptionsMenu(i);

                            if (i.customId === "addExeptionButton") {
                              i.update({
                                embeds: [
                                  embed(`**Automod - User Exceptions**
                                                      Please tag the user you want to add to the exceptions list.`),
                                ],
                                components: [],
                              });

                              interaction.fetchReply().then(async (msg) => {
                                Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,true)

                                var msgCollector =
                                  msg.channel.createMessageCollector({
                                    msgFilter,
                                    max: 1,
                                  });

                                msgCollector.on(
                                  "collect",
                                  async (collected) => {
                                    collected.delete();

                                    let exceptionRole = collected.content;

                                    if (userRegex.test(exceptionRole)) {
                                      exceptionRole =
                                        msg.guild.members.cache.find(
                                          (c) =>
                                            c.id ===
                                            userRegex.exec(exceptionRole)[1]
                                        );
                                    } else {
                                      exceptionRole =
                                        msg.guild.members.cache.find(
                                          (c) =>
                                            c.id === exceptionRole ||
                                            c.name === exceptionRole
                                        );
                                    }

                                    if (!exceptionRole) {
                                      return i
                                        .editReply({
                                          embeds: [
                                            embed(`**Automod - User Exceptions**
                                                          ❌ I could not find that user!`),
                                          ],
                                          components: [],
                                        })
                                        .then((msg) => {
                                                                    Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)

                                          setTimeout(() => {
                                            userExemptMenu(i);
                                          }, 3000);
                                        });
                                    }

                                    automod.exempt.users.push(exceptionRole.id);

                                    guild.markModified(
                                      "addons.automod.exempt.users"
                                    );

                                    guild
                                      .save()
                                      .then(() => {
                                        Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)

                                        i.editReply({
                                          embeds: [
                                            embed(`**Automod - User Exceptions**
                                                        ✅ Successfully added ${exceptionRole} to the users-list!`),
                                          ],
                                          components: [],
                                        });
                                        setTimeout(
                                          () => userExemptMenu(i),
                                          2000
                                        );
                                      })
                                      .catch((err) => {
                                        Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)

                                        i.editReply({
                                          embeds: [
                                            embed(`**Dashboard**
                                                          ❌ I couldn't save the settings.
                                                          
                                                          **Error Message**
                                                          > ${err.stack}`),
                                          ],
                                          components: [],
                                        });
                                      });
                                  }
                                );
                              });
                            }

                            if (i.customId === "remExeptionButton") {
                              i.update({
                                embeds: [
                                  embed(`**Automod - User Exceptions**
                                                      Please write the user you want to remove from the exceptions list.`),
                                ],
                                components: [],
                              });

                              interaction.fetchReply().then(async (msg) => {
                                Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,true)

                                var msgCollector =
                                  msg.channel.createMessageCollector({
                                    msgFilter,
                                    max: 1,
                                  });

                                msgCollector.on(
                                  "collect",
                                  async (collected) => {
                                    collected.delete();

                                    let exceptionRole = collected.content;

                                    if (userRegex.test(exceptionRole)) {
                                      exceptionRole =
                                        msg.guild.members.cache.find(
                                          (c) =>
                                            c.id ===
                                            userRegex.exec(exceptionRole)[1]
                                        );
                                    } else {
                                      exceptionRole =
                                        msg.guild.members.cache.find(
                                          (c) =>
                                            c.id === exceptionRole ||
                                            c.name === exceptionRole
                                        );
                                    }

                                    if (!exceptionRole) {
                                      return i
                                        .editReply({
                                          embeds: [
                                            embed(`**Automod - User Exceptions**
                                                          ❌ I could not find that user!`),
                                          ],
                                          components: [],
                                        })
                                        .then((msg) => {
                                                                    Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                                          setTimeout(() => {
                                            userExemptMenu(i);
                                          }, 3000);
                                        });
                                    }

                                    if (
                                      !automod.exempt.users.includes(
                                        exceptionRole.id
                                      )
                                    ) {
                                      return i
                                        .editReply({
                                          embeds: [
                                            embed(`**Automod - User Exceptions**
                                                          ❌ That user is not on the exempt list!`),
                                          ],
                                          components: [],
                                        })
                                        .then((msg) => {
                                          Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)

                                          setTimeout(() => {
                                            userExemptMenu(i);
                                          }, 3000);
                                        });
                                    }

                                    for (var i in automod.exempt.users) {
                                      if (
                                        automod.exempt.users[i] ===
                                        exceptionRole.id
                                      ) {
                                        automod.exempt.users.splice(i, 1);
                                      }
                                    }

                                    guild.markModified(
                                      "addons.automod.exempt.users"
                                    );

                                    guild
                                      .save()
                                      .then(() => {
                                        Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)

                                        i.editReply({
                                          embeds: [
                                            embed(`**Automod - User Exceptions**
                                                        ✅ Successfully removed ${exceptionRole} from the users-list!`),
                                          ],
                                          components: [],
                                        });
                                        setTimeout(
                                          () => userExemptMenu(i),
                                          2000
                                        );
                                      })
                                      .catch((err) => {
                                        Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)

                                        i.editReply({
                                          embeds: [
                                            embed(`**Dashboard**
                                                          ❌ I couldn't save the settings.
                                                          
                                                          **Error Message**
                                                          > ${err.stack}`),
                                          ],
                                          components: [],
                                        });
                                      });
                                  }
                                );
                              });
                            }
                          });
                        }
                        userExemptMenu(i);
                      }
                    });
                  }
                  exeptionsMenu(i);
                }
              });
            }

            autoModMenu(i);
          }
          if (i.customId === "advancedLogsButton") {
            const settingsRow1 = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId("messageUpdateButton")
                .setLabel("Toggle Message Update")
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId("emojiUpdateButton")
                .setLabel("Toggle Emoji Update")
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId("banUpdateButton")
                .setLabel("Toggle Ban Update")
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId("memberUpdateButton")
                .setLabel("Toggle Member Update")
                .setStyle(ButtonStyle.Primary)
            );

            const settingsRow2 = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId("guildUpdateButton")
                .setLabel("Toggle Guild Update")
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId("roleUpdateButton")
                .setLabel("Toggle Role Update")
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId("channelUpdateButton")
                .setLabel("Toggle Channel Update")
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId("settingsBack")
                .setLabel("Go back")
                .setStyle(ButtonStyle.Danger)
            );

            function advancedLogsReturn(i) {
              if (i.replied) {
                i.editReply({
                  embeds: [
                    embed(`**Advanced-Logs**
                                  Message Update
                                  > Enabled - ${
                                    advancedLogs.messageUpdate ? "✅" : "❌"
                                  }
                                  Emoji Update
                                  > Enabled - ${
                                    advancedLogs.emojiUpdate ? "✅" : "❌"
                                  }
                                  Ban Update
                                  > Enabled - ${
                                    advancedLogs.banUpdate ? "✅" : "❌"
                                  }
                                  Member Update
                                  > Enabled - ${
                                    advancedLogs.memberUpdate ? "✅" : "❌"
                                  }
                                  Guild Update
                                  > Enabled - ${
                                    advancedLogs.guildUpdate ? "✅" : "❌"
                                  }
                                  Role Update
                                  > Enabled - ${
                                    advancedLogs.roleUpdate ? "✅" : "❌"
                                  }
                                  Channel Update
                                  > Enabled - ${
                                    advancedLogs.channelUpdate ? "✅" : "❌"
                                  }
                                  `),
                  ],
                  components: [settingsRow1, settingsRow2],
                });
              } else {
                i.update({
                  embeds: [
                    embed(`**Advanced-Logs**
                                  Message Update
                                  > Enabled - ${
                                    advancedLogs.messageUpdate ? "✅" : "❌"
                                  }
                                  Emoji Update
                                  > Enabled - ${
                                    advancedLogs.emojiUpdate ? "✅" : "❌"
                                  }
                                  Ban Update
                                  > Enabled - ${
                                    advancedLogs.banUpdate ? "✅" : "❌"
                                  }
                                  Member Update
                                  > Enabled - ${
                                    advancedLogs.memberUpdate ? "✅" : "❌"
                                  }
                                  Guild Update
                                  > Enabled - ${
                                    advancedLogs.guildUpdate ? "✅" : "❌"
                                  }
                                  Role Update
                                  > Enabled - ${
                                    advancedLogs.roleUpdate ? "✅" : "❌"
                                  }
                                  Channel Update
                                  > Enabled - ${
                                    advancedLogs.channelUpdate ? "✅" : "❌"
                                  }
                                  `),
                  ],
                  components: [settingsRow1, settingsRow2],
                });
              }

              const collector =
                interaction.channel.createMessageComponentCollector({
                  buttonFilter,
                  time: 30000,
                  max: 1,
                });
              collector.on("collect", async (i) => {
                if (i.customId === "settingsBack") return mainMenu(i);

                if (i.customId === "messageUpdateButton") {
                  advancedLogs.messageUpdate = !advancedLogs.messageUpdate;

                  return guild
                    .save()
                    .then(() => {
                      i.update({
                        embeds: [
                          embed(`**Advanced-Logs**
                                      ✅ The Message Update module has been **${
                                        advancedLogs.messageUpdate
                                          ? "enabled"
                                          : "disabled"
                                      }**`),
                        ],
                        components: [],
                      });

                      setTimeout(() => {
                        advancedLogsReturn(i);
                      }, 3000);
                    })
                    .catch((err) => {
                      i.update({
                        embeds: [
                          embed(`**Dashboard**
                                        ❌ I couldn't save the settings.
                                        
                                        **Error Message**
                                        > ${err.stack}`),
                        ],
                        components: [],
                      });
                      setTimeout(() => {
                        advancedLogsReturn(i);
                      }, 3000);
                    });
                }

                if (i.customId === "emojiUpdateButton") {
                  advancedLogs.emojiUpdate = !advancedLogs.emojiUpdate;

                  return guild
                    .save()
                    .then(() => {
                      i.update({
                        embeds: [
                          embed(`**Advanced-Logs**
                                      ✅ The Emoji Update module has been **${
                                        advancedLogs.emojiUpdate
                                          ? "enabled"
                                          : "disabled"
                                      }**`),
                        ],
                        components: [],
                      });
                      setTimeout(() => {
                        advancedLogsReturn(i);
                      }, 3000);
                    })
                    .catch((err) => {
                      i.update({
                        embeds: [
                          embed(`**Dashboard**
                                        ❌ I couldn't save the settings.
                                        
                                        **Error Message**
                                        > ${err.stack}`),
                        ],
                        components: [],
                      });
                      setTimeout(() => {
                        advancedLogsReturn(i);
                      }, 3000);
                    });
                }

                if (i.customId === "banUpdateButton") {
                  advancedLogs.banUpdate = !advancedLogs.banUpdate;

                  return guild
                    .save()
                    .then(() => {
                      i.update({
                        embeds: [
                          embed(`**Advanced-Logs**
                                      ✅ The Ban Update module has been **${
                                        advancedLogs.banUpdate
                                          ? "enabled"
                                          : "disabled"
                                      }**`),
                        ],
                        components: [],
                      });

                      setTimeout(() => {
                        advancedLogsReturn(i);
                      }, 3000);
                    })
                    .catch((err) => {
                      i.update({
                        embeds: [
                          embed(`**Dashboard**
                                        ❌ I couldn't save the settings.
                                        
                                        **Error Message**
                                        > ${err.stack}`),
                        ],
                        components: [],
                      });
                      setTimeout(() => {
                        advancedLogsReturn(i);
                      }, 3000);
                    });
                }

                if (i.customId === "memberUpdateButton") {
                  advancedLogs.memberUpdate = !advancedLogs.memberUpdate;

                  return guild
                    .save()
                    .then(() => {
                      i.update({
                        embeds: [
                          embed(`**Advanced-Logs**
                                      ✅ The Member Update module has been **${
                                        advancedLogs.memberUpdate
                                          ? "enabled"
                                          : "disabled"
                                      }**`),
                        ],
                        components: [],
                      });

                      setTimeout(() => {
                        advancedLogsReturn(i);
                      }, 3000);
                    })
                    .catch((err) => {
                      i.update({
                        embeds: [
                          embed(`**Dashboard**
                                        ❌ I couldn't save the settings.
                                        
                                        **Error Message**
                                        > ${err.stack}`),
                        ],
                        components: [],
                      });
                      setTimeout(() => {
                        advancedLogsReturn(i);
                      }, 3000);
                    });
                }

                if (i.customId === "guildUpdateButton") {
                  advancedLogs.guildUpdate = !advancedLogs.guildUpdate;

                  return guild
                    .save()
                    .then(() => {
                      i.update({
                        embeds: [
                          embed(`**Advanced-Logs**
                                      ✅ The Guild Update module has been **${
                                        advancedLogs.guildUpdate
                                          ? "enabled"
                                          : "disabled"
                                      }**`),
                        ],
                        components: [],
                      });
                      setTimeout(() => {
                        advancedLogsReturn(i);
                      }, 3000);
                    })
                    .catch((err) => {
                      i.update({
                        embeds: [
                          embed(`**Dashboard**
                                        ❌ I couldn't save the settings.
                                        
                                        **Error Message**
                                        > ${err.stack}`),
                        ],
                        components: [],
                      });
                      setTimeout(() => {
                        advancedLogsReturn(i);
                      }, 3000);
                    });
                }

                if (i.customId === "roleUpdateButton") {
                  advancedLogs.roleUpdate = !advancedLogs.roleUpdate;

                  return guild
                    .save()
                    .then(() => {
                      i.update({
                        embeds: [
                          embed(`**Advanced-Logs**
                                      ✅ The Role Update module has been **${
                                        advancedLogs.roleUpdate
                                          ? "enabled"
                                          : "disabled"
                                      }**`),
                        ],
                        components: [],
                      });

                      setTimeout(() => {
                        advancedLogsReturn(i);
                      }, 3000);
                    })
                    .catch((err) => {
                      i.update({
                        embeds: [
                          embed(`**Dashboard**
                                        ❌ I couldn't save the settings.
                                        
                                        **Error Message**
                                        > ${err.stack}`),
                        ],
                        components: [],
                      });
                      setTimeout(() => {
                        advancedLogsReturn(i);
                      }, 3000);
                    });
                }

                if (i.customId === "channelUpdateButton") {
                  advancedLogs.channelUpdate = !advancedLogs.channelUpdate;

                  return guild
                    .save()
                    .then(() => {
                      i.update({
                        embeds: [
                          embed(`**Advanced-Logs**
                                      ✅ The Channel Update module has been **${
                                        advancedLogs.channelUpdate
                                          ? "enabled"
                                          : "disabled"
                                      }**`),
                        ],
                        components: [],
                      });

                      setTimeout(() => {
                        advancedLogsReturn(i);
                      }, 3000);
                    })
                    .catch((err) => {
                      i.update({
                        embeds: [
                          embed(`**Dashboard**
                                        ❌ I couldn't save the settings.
                                        
                                        **Error Message**
                                        > ${err.stack}`),
                        ],
                        components: [],
                      });
                      setTimeout(() => {
                        advancedLogsReturn(i);
                      }, 3000);
                    });
                }
              });
            }
            advancedLogsReturn(i);
          }
          if (i.customId === "securityButton") {
            const settingsRow = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId("toggleSecurityButton")
                .setLabel("Toggle Security")
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId("autoKickButton")
                .setLabel("Auto-Kick settings")
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId("ageCheckerButton")
                .setLabel("Age-Checker settings")
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId("secBackButton")
                .setLabel("Go back")
                .setStyle(ButtonStyle.Danger)
            );

            async function securityMenu(i) {
              if (!security) return;
              if (i.replied) {
                i.editReply({
                  embeds: [
                    embed(`**Security**
                                            Enabled - ${
                                              security.enabled ? "✅" : "❌"
                                            }
                                            
                                            **Auto-Kick**
                                            > Enabled - ${
                                              security.modules.autoKick.enabled
                                                ? "✅"
                                                : "❌"
                                            }
                                            > Age - \`${prettyMS(
                                              security.modules.autoKick.age
                                            )}\`
                                            
                                            **Age-Checker**
                                            > Enabled - ${
                                              security.modules.ageChecker
                                                .enabled
                                                ? "✅"
                                                : "❌"
                                            }
                                            > Age - \`${prettyMS(
                                              security.modules.ageChecker.age
                                            )}\``),
                  ],
                  components: [settingsRow],
                });
              } else {
                i.update({
                  embeds: [
                    embed(`**Security**
                                            Enabled - ${
                                              security.enabled ? "✅" : "❌"
                                            }
                                            
                                            **Auto-Kick**
                                            > Enabled - ${
                                              security.modules.autoKick.enabled
                                                ? "✅"
                                                : "❌"
                                            }
                                            > Age - \`${prettyMS(
                                              security.modules.autoKick.age
                                            )}\`
                                            
                                            **Age-Checker**
                                            > Enabled - ${
                                              security.modules.ageChecker
                                                .enabled
                                                ? "✅"
                                                : "❌"
                                            }
                                            > Age - \`${prettyMS(
                                              security.modules.ageChecker.age
                                            )}\``),
                  ],
                  components: [settingsRow],
                });
              }

              const collector =
                interaction.channel.createMessageComponentCollector({
                  buttonFilter,
                  time: 30000,
                  max: 1,
                });
              collector.on("collect", async (i) => {
                if (i.customId === "secBackButton") {
                  return mainMenu(i);
                }

                if (i.customId === "toggleSecurityButton") {
                  security.enabled = !security.enabled;

                  return guild
                    .save()
                    .then(() => {
                      i.update({
                        embeds: [
                          embed(`**Security**
                                              ✅ The Security module has been **${
                                                security.enabled
                                                  ? "enabled"
                                                  : "disabled"
                                              }**`),
                        ],
                        components: [],
                      });
                    })
                    .catch((err) => {
                      i.update({
                        embeds: [
                          embed(`**Dashboard**
                                                ❌ I couldn't save the settings.
                                                
                                                **Error Message**
                                                > ${err.stack}`),
                        ],
                        components: [],
                      });
                    })
                    .then(() => {
                      setTimeout(() => {
                        securityMenu(i);
                      }, 3000);
                    });
                }

                if (i.customId === "autoKickButton") {
                  const settingsRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                      .setCustomId("toggleAutoKickButton")
                      .setLabel("Toggle Auto-Kick")
                      .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                      .setCustomId("setAgeButton")
                      .setLabel("Set Age")
                      .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                      .setCustomId("secMenuButton")
                      .setLabel("Go Back")
                      .setStyle(ButtonStyle.Primary)
                  );
                  function autoKickBack(i) {
                    if (i.replied) {
                      i.editReply({
                        embeds: [
                          embed(`**Auto-Kick**
                                                      Enabled - ${
                                                        security.modules
                                                          .autoKick.enabled
                                                          ? "✅"
                                                          : "❌"
                                                      }
                                                      Age - \`${prettyMS(
                                                        security.modules
                                                          .autoKick.age
                                                      )}\``),
                        ],
                        components: [settingsRow],
                      });
                    } else {
                      i.update({
                        embeds: [
                          embed(`**Auto-Kick**
                                                      Enabled - ${
                                                        security.modules
                                                          .autoKick.enabled
                                                          ? "✅"
                                                          : "❌"
                                                      }
                                                      Age - \`${prettyMS(
                                                        security.modules
                                                          .autoKick.age
                                                      )}\``),
                        ],
                        components: [settingsRow],
                      });
                    }
                    const collector =
                      interaction.channel.createMessageComponentCollector({
                        buttonFilter,
                        time: 30000,
                        max: 1,
                      });
                    collector.on("collect", async (i) => {
                      if (i.customId === "toggleAutoKickButton") {
                        security.modules.autoKick.enabled =
                          !security.modules.autoKick.enabled;

                        return guild
                          .save()
                          .then(() => {
                            i.update({
                              embeds: [
                                embed(`**Security**
                                                          ✅ The Auto-Kick module has been **${
                                                            security.modules
                                                              .autoKick.enabled
                                                              ? "enabled"
                                                              : "disabled"
                                                          }**`),
                              ],
                              components: [],
                            });
                            setTimeout(() => {
                              autoKickBack(i);
                            }, 3000);
                          })
                          .catch((err) => {
                            i.update({
                              embeds: [
                                embed(`**Dashboard**
                                                            ❌ I couldn't save the settings.
                                                            
                                                            **Error Message**
                                                            > ${err.stack}`),
                              ],
                              components: [],
                            });
                            setTimeout(() => {
                              autoKickBack(i);
                            }, 3000);
                          });
                      }

                      if (i.customId === "secMenuButton") {
                        securityMenu(i);
                      }

                      if (i.customId === "setAgeButton") {
                        i.update({
                          embeds: [
                            embed(`**Auto-Kick**
                                                            Please respond with the minimum account age to be in the server!`),
                          ],
                          components: [],
                        }).then((msg) => {
                          interaction.fetchReply().then(async (msg) => {
                            Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,true)

                            var msgCollector =
                              msg.channel.createMessageCollector({
                                msgFilter,
                                max: 1,
                              });

                            msgCollector.on("collect", async (collected) => {
                              collected.delete();

                              let age = ms(collected.content.split(" ")[0]);

                              if (isNaN(age)) {
                                return i
                                  .editReply({
                                    embeds: [
                                      embed(`**Auto-Kick**
                                                                  ❌ That is not a valid number.`),
                                    ],
                                  })
                                  .then((msg) => {
                                    Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)

                                    setTimeout(() => {
                                      autoKickBack(i);
                                    }, 3000);
                                  });
                              }

                              if (age === undefined) {
                                return i
                                  .editReply({
                                    embeds: [
                                      embed(`**Auto-Kick**
                                                                  ❌ You didn't define a valid age.`),
                                    ],
                                  })
                                  .then((msg) => {
                                    Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)

                                    setTimeout(() => {
                                      autoKickBack(i);
                                    }, 3000);
                                  });
                              }

                              if (age > 2678400000) {
                                return i
                                  .update({
                                    embeds: [
                                      embed(`**Auto-Kick**
                                                                  ❌ The age has to be 31 days or less, for the module to be enabled.`),
                                    ],
                                  })
                                  .then((msg) => {
                                    Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)

                                    setTimeout(() => {
                                      autoKickBack(i);
                                    }, 3000);
                                  });
                              }

                              security.modules.autoKick.age = age;

                              return guild
                                .save()
                                .then(() => {
                                  Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)

                                  i.editReply({
                                    embeds: [
                                      embed(`**Auto-Kick**
                                                                ✅ The Auto-Kick age has been changed to **${prettyMS(
                                                                  security
                                                                    .modules
                                                                    .autoKick
                                                                    .age,
                                                                  {
                                                                    verbose: true,
                                                                  }
                                                                )}**`),
                                    ],
                                    components: [],
                                  });
                                  setTimeout(() => {
                                    autoKickBack(i);
                                  }, 3000);
                                })
                                .catch((err) => {
                                  Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)

                                  i.editReply({
                                    embeds: [
                                      embed(`**Dashboard**
                                                                  ❌ I couldn't save the settings.
                                                                  
                                                                  **Error Message**
                                                                  > ${err.stack}`),
                                    ],
                                    components: [],
                                  });
                                  setTimeout(() => {
                                    autoKickBack(i);
                                  }, 3000);
                                });
                            });
                          });
                        });
                      }
                    });
                  }
                  autoKickBack(i);
                }

                if (i.customId === "ageCheckerButton") {
                  const settingsRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                      .setCustomId("toggleAgeCheckerButton")
                      .setLabel("Toggle Age-Checker")
                      .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                      .setCustomId("setAgeButton")
                      .setLabel("Set Age")
                      .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                      .setCustomId("backButton")
                      .setLabel("Go Back")
                      .setStyle(ButtonStyle.Danger)
                  );

                  function ageCheckerBack(i) {
                    if (i.replied) {
                      i.editReply({
                        embeds: [
                          embed(`**Age-Checker**
                                                      Enabled - ${
                                                        security.modules
                                                          .ageChecker.enabled
                                                          ? "✅"
                                                          : "❌"
                                                      }
                                                      Age - \`${prettyMS(
                                                        security.modules
                                                          .ageChecker.age
                                                      )}\``),
                        ],
                        components: [settingsRow],
                      });
                    } else {
                      i.update({
                        embeds: [
                          embed(`**Age-Checker**
                                                      Enabled - ${
                                                        security.modules
                                                          .ageChecker.enabled
                                                          ? "✅"
                                                          : "❌"
                                                      }
                                                      Age - \`${prettyMS(
                                                        security.modules
                                                          .ageChecker.age
                                                      )}\``),
                        ],
                        components: [settingsRow],
                      });
                    }
                    const collector =
                      interaction.channel.createMessageComponentCollector({
                        buttonFilter,
                        time: 30000,
                        max: 1,
                      });
                    collector.on("collect", async (i) => {
                      if (i.customId === "backButton") securityMenu(i);

                      if (i.customId === "toggleAgeCheckerButton") {
                        security.modules.ageChecker.enabled =
                          !security.modules.ageChecker.enabled;

                        return guild
                          .save()
                          .then(() => {
                            i.update({
                              embeds: [
                                embed(`**Age-Checker**
                                                          ✅ The Age-Checker module has been **${
                                                            security.modules
                                                              .ageChecker
                                                              .enabled
                                                              ? "enabled"
                                                              : "disabled"
                                                          }**`),
                              ],
                              components: [],
                            });
                            setTimeout(() => {
                              ageCheckerBack(i);
                            }, 3000);
                          })
                          .catch((err) => {
                            i.update({
                              embeds: [
                                embed(`**Dashboard**
                                                            ❌ I couldn't save the settings.
                                                            
                                                            **Error Message**
                                                            > ${err.stack}`),
                              ],
                              components: [],
                            });
                            setTimeout(() => {
                              ageCheckerBack(i);
                            }, 3000);
                          });
                      }

                      if (i.customId === "setAgeButton") {
                        i.update({
                          embeds: [
                            embed(`**Age-Checker**
                                                            Please respond with the maximum account age to alerted for!`),
                          ],
                          components: [],
                        }).then((msg) => {
                          interaction.fetchReply().then(async (msg) => {
                            Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,true)

                            var msgCollector =
                              msg.channel.createMessageCollector({
                                msgFilter,
                                max: 1,
                              });

                            msgCollector.on("collect", async (collected) => {
                              collected.delete();

                              let age = ms(collected.content.split(" ")[0]);

                              if (isNaN(age)) {
                                
                                return i
                                  .editReply({
                                    embeds: [
                                      embed(`**Age-Checker**
                                                                  ❌ That is not a valid number.`),
                                    ],
                                  })
                                  .then((msg) => {
                                    Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)

                                    setTimeout(() => {
                                      ageCheckerBack(i);
                                    }, 3000);
                                  });
                              }

                              if (age === undefined) {
                                return i
                                  .editReply({
                                    embeds: [
                                      embed(`**Age-Checker**
                                                                  ❌ You didn't define a valid age.`),
                                    ],
                                  })
                                  .then((msg) => {
                                    Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)

                                    setTimeout(() => {
                                      ageCheckerBack(i);
                                    }, 3000);
                                  });
                              }

                              if (age > 2678400000) {
                                return i
                                  .editReply({
                                    embeds: [
                                      embed(`**Age-Checker**
                                                                  ❌ The age has to be 31 days or less, for the module to be enabled.`),
                                    ],
                                  })
                                  .then((msg) => {
                                    Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)

                                    setTimeout(() => {
                                      ageCheckerBack(i);
                                    }, 3000);
                                  });
                              }

                              security.modules.ageChecker.age = age;

                              return guild
                                .save()
                                .then(() => {
                                  Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)

                                  i.editReply({
                                    embeds: [
                                      embed(`**Age-Checker**
                                                                ✅ The Age-Checker age has been changed to **${prettyMS(
                                                                  security
                                                                    .modules
                                                                    .ageChecker
                                                                    .age,
                                                                  {
                                                                    verbose: true,
                                                                  }
                                                                )}**`),
                                    ],
                                    components: [],
                                  });

                                  setTimeout(() => {
                                    ageCheckerBack(i);
                                  }, 3000);
                                })
                                .catch((err) => {
                                  Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)

                                  i.editReply({
                                    embeds: [
                                      embed(`**Dashboard**
                                                                  ❌ I couldn't save the settings.
                                                                  
                                                                  **Error Message**
                                                                  > ${err.stack}`),
                                    ],
                                    components: [],
                                  });
                                  setTimeout(() => {
                                    ageCheckerBack(i);
                                  }, 3000);
                                });
                            });
                          });
                        });
                      }
                    });
                  }
                  ageCheckerBack(i);
                }
              });
            }
            securityMenu(i);
          }
        });
      });
    }

    mainMenu(null);
  },
};
