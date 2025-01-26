let { getGuild } = require("../../Utils/Database");
let { embed, noPerms } = require("../../Utils/Embeds");

let { mainColor } = require("../../config.json");

const {
    ButtonBuilder,
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonStyle,
  } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lockdown")
    .setDescription("Lock the server."),
  execute: async (Acuity, interaction) => {
    let guild = await getGuild(interaction.guild.id);

    if (!interaction.member.permissions.has("ADMINISTRATOR"))
      return interaction
        .reply({ embeds: [noPerms("ADMINISTRATOR")] })
        .then((m) =>
          interaction.fetchReply().then((m) => {
            setTimeout(() => {
              m.delete();
            }, 3000);
          })
        );

    const buttonFilter = (i) =>
      i.message.id === msg.id && i.user.id === interaction.member.id;
    const msgFilter = (m) => m.user.id === interaction.user.id;

    let channelRegex = /<#(\d{17,19})>/i;
    let roleRegex = /<@&(\d{17,19})>/i;
    let userRegex = /<@!?(\d{17,19})>/i;

    if(!interaction.guild.members.me.permissions.has("ADMINISTRATOR")) {

      return interaction.reply({embeds: [embed(`**Lockdown**
      I do not have the required perms to lock the server down!
      
      Acuity needs to have **ADMINISTRATOR** permissions to lockdown the server.
      **The Acuity role should also be on the top of the roles list, because Acuity needs this to add roles to all of the users in the guild. (People with Administrator shouldn't be affected!)**`)]})

    }

    let botMember = interaction.guild.members.cache.find(
      (c) => c.id === Acuity.user.id
    );

    const settingsRow1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("lockServerButton")
        .setLabel("Lock Server")
        .setStyle(ButtonStyle.Danger)
        .setEmoji("🔒"),
      new ButtonBuilder()
        .setCustomId("unlockGuildButton")
        .setLabel("Unlock Server")
        .setStyle(ButtonStyle.Success)
        .setEmoji("🔓")
    );
    interaction
      .reply({
        embeds: [
          embed(`**Lockdown**
          Do you want to unlock or lock the server?

          Current status: \`${
            guild.addons.lockdown.isEnabled ? "Enabled" : "Disabled"
          }\`
    `),
        ],
        components: [settingsRow1],
      })
      .then(async (msg) => {
        interaction.fetchReply().then(async (msg) => {
          const collector = interaction.channel.createMessageComponentCollector(
            {
              buttonFilter,
              time: 30000,
              max: 1,
            }
          );
          collector.on("collect", async (i) => {
            if (i.customId === "lockServerButton") {
              if (guild.addons.lockdown.isEnabled) {
                return i
                  .update({
                    embeds: [
                      embed(`**Lockdown**
                    🔒 The guild is already in lockdown!
                
                >    Reason: \`${guild.addons.lockdown.reason}\``),
                    ],
                    components: [],
                  })
                  .then((msg) => {
                    interaction.fetchReply().then(async (msg) => {
                      setTimeout(() => {
                        msg.delete();
                      }, 5000);
                    });
                  });
              }

              i.update({
                embeds: [
                  embed(`**Lockdown**
                Why do you want to lock the server?`),
                ],
                components: [],
              }).then((msg) => {
                interaction.fetchReply().then(async (msg) => {
                  var msgCollector = msg.channel.createMessageCollector({
                    msgFilter,
                    max: 1,
                  });

                  msgCollector.on("collect", async (collected) => {
                    if (interaction.guild.members.me.permissions.has("MANAGE_MESSAGES"))
                      collected.delete();

                    let reason = collected.content;
                    interaction
                      .editReply({
                        embeds: [
                          embed(`**Lockdown**
                            🔒 Successfully locked the guild!`),
                        ],
                      })
                      .then(async (msg) => {
                        interaction.fetchReply().then(async (msg) => {
                          setTimeout(() => {
                            msg.delete();
                          }, 5000);
                        });
                        let lockRole = interaction.guild.roles.cache.find(
                          (c) => c.name === "Lockdown"
                        );

                        if (!lockRole) {
                          interaction.guild.roles
                            .create({
                              name: "Lockdown",
                              color: mainColor,
                              position: 0,
                              reason: "Acuity - Lockdown Initiated",
                            })
                            .then(async (role) => {
                              await interaction.guild.channels.cache.forEach(
                                async (channel, id) => {
                                  
                                    await channel.permissionOverwrites
                                      .create(role, {
                                        Speak: false,
                                        Connect: false,
                                        SendMessages: false,
                                        AddReactions: false,
                                      })
                                      .catch((err) => {
                                        return console.log(
                                          err + " | " + channel.id
                                        );
                                      });
                                }
                              );

                              await interaction.guild.members.cache.forEach(
                                async (member, id) => {
                                  if (
                                    interaction.guild.members.me.permissions.has(
                                      "MANAGE_ROLES"
                                    )
                                  )
                                    member.roles.add(role);
                                }
                              );
                            });

                          guild.addons.lockdown.reason = reason;
                          guild.addons.lockdown.isEnabled = true;
                        } else {
                          await interaction.guild.channels.cache.forEach(
                            async (channel, id) => {
                              await channel.permissionOverwrites.create(
                                lockRole,
                                {
                                  Speak: false,
                                  Connect: false,
                                  SendMessages: false,
                                  AddReactions: false,
                                }
                              );
                            }
                          );

                          await interaction.guild.members.cache.forEach(
                            async (member, id) => {
                              if (
                                interaction.guild.members.me.permissions.has(
                                  "MANAGE_ROLES"
                                )
                              )
                                member.roles.add(lockRole);
                            }
                          );

                          guild.addons.lockdown.reason = await reason;
                          guild.addons.lockdown.isEnabled = true;
                        }

                        interaction.channel
                          .send({
                            embeds: [
                              embed(`**Lockdown**
                          The server is currently in lockdown!
                          
                          > Reason: \`${reason}\``),
                            ],
                          })
                          .then(async (msg) => {
                            msg.pin();
                            guild.addons.lockdown.message = {
                              messageID: msg.id,
                              channelID: msg.channel.id,
                            };

                            guild.save().catch((err) => console.log(err));
                          });
                      });
                  });
                });
              });
            }

            if (i.customId === "unlockGuildButton") {
              if (guild.addons.lockdown.isEnabled === false) {
                return i
                  .update({
                    embeds: [
                      embed(`**Lockdown**
                      🔓 The guild is already unlocked!`),
                    ],
                    components: [],
                  })
                  .then(async (msg) => {
                    interaction.fetchReply().then(async (msg) => {
                      setTimeout(() => {
                        msg.delete();
                      }, 5000);
                    });
                  });
              }

              const settingsRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setCustomId("confirmButton")
                  .setStyle(ButtonStyle.Success)
                  .setLabel("Yes")
                  .setEmoji("✅"),
                new ButtonBuilder()
                  .setCustomId("denyButton")
                  .setStyle(ButtonStyle.Danger)
                  .setLabel("No")
                  .setEmoji("❌")
              );

              return i
                .update({
                  embeds: [
                    embed(`**Lockdown**
                Do you really want to unlock the guild?`),
                  ],
                  components: [settingsRow],
                })
                .then((msg) => {
                  interaction.fetchReply().then(async (msg) => {
                    const collector =
                      interaction.channel.createMessageComponentCollector({
                        buttonFilter,
                        time: 30000,
                        max: 1,
                      });
                    collector.on("collect", async (i) => {
                      if (i.customId === "confirmButton") {
                        i.update({
                          embeds: [
                            embed(`**Lockdown**
                              🔓 Successfully unlocked the guild.`),
                          ],
                          components: [],
                        }).then((msg) => {
                          interaction.fetchReply().then(async (msg) => {
                            setTimeout(() => {
                              msg.delete();
                            }, 5000);
                          });
                        });

                        let lockDownRole = interaction.guild.roles.cache.find(
                          (c) => c.name === "Lockdown"
                        );
                        if (lockDownRole) lockDownRole.delete();

                        let channel = interaction.guild.channels.cache.get(
                          guild.addons.lockdown.message.channelID
                        );
                        let message;
                        if (
                          channel &&
                          guild.addons.lockdown.message.messageID !== ""
                        ) {
                          if (
                            interaction.guild.members.me
                              .permissionsIn(channel)
                              .has([
                                "ViewChannel",
                                "ReadMessageHistory",
                                "ManageMessages",
                              ])
                          ) {
                            let msg = await channel.messages.fetch(
                              guild.addons.lockdown.message.messageID
                            ).then((msg) => {
                                msg.delete().catch((err) => {});
                            }).catch(err => {});

                          }
                        }

                        guild.addons.lockdown.message.channelID = "";
                        guild.addons.lockdown.message.messageID = "";
                        guild.addons.lockdown.isEnabled = false;
                        guild.addons.lockdown.reason = "";

                        guild.save().catch((err) => console.log(err));
                      }
                    });
                  });
                });
            }
          });
        });
      });
  },
};
