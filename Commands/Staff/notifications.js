const {
  ButtonBuilder,
  SlashCommandBuilder,
  ActionRowBuilder,
  PermissionFlagsBits,
  ButtonStyle,
  Webhook,
  CommandInteractionOptionResolver,
} = require("discord.js");
const notifications = require("../../Models/notifications");

let { getGuild } = require("../../Utils/Database");
let { embed, noPerms } = require("../../Utils/Embeds");


const { twitchToken } = require("../../config.json");
const { default: fetch } = require("node-fetch");
const { youtube } = require('scrape-youtube');
const TwitchApi = require("node-twitch").default;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("notifications")
    .setDescription("Add a notification to the guild.")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  execute: async (Acuity, interaction) => {
    await interaction.deferReply();

    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return interaction
        .editReply({
          embeds: [noPerms("Administrator")],
        })
        .then((m) =>
          interaction.fetchReply().then(async (m) =>
            setTimeout(() => {
              m.delete();
            }, 5000)
          )
        );

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageWebhooks))
        return interaction
          .editReply({
            embeds: [embed(`**Notifications**
            I do not have access to manage webhooks.
            
            Please let me be able to manage webhooks before trying again`)],
          })
          .then((m) =>
            interaction.fetchReply().then(async (m) =>
              setTimeout(() => {
                m.delete();
              }, 5000)
            )
          );

    const buttonFilter = (i) =>
      i.message.id === msg.id && i.user.id === interaction.member.id;
    const msgFilter = (m) => m.user.id === interaction.user.id;

    let channelRegex = /<#(\d{17,19})>/i;
    let roleRegex = /<@&(\d{17,19})>/i;
    let userRegex = /<@!?(\d{17,19})>/i;


    const twitch = new TwitchApi({
      client_id: "yojh1yr1ieesk7l5ocul7iebwls649",
      client_secret: twitchToken
    });


    const settingsRow1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("addButton")
        .setLabel("Add Notification")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("listButton")
        .setLabel("List Notifications")
        .setStyle(ButtonStyle.Primary)
    );

    interaction
      .editReply({
        embeds: [
          embed(`**Notifications**
          Choose what you want to do down below.
          If you want to remove a notification, remove the webhook that the notification is set to.          
          `),
        ],
        components: [settingsRow1],
      })
      .then(async (int) => {
        await interaction.fetchReply().then((msg) => {
          const collector = interaction.channel.createMessageComponentCollector(
            {
              buttonFilter,
              time: 30000,
              max: 1,
            }
          );
          collector.on("collect", async (i) => {
            if (i.customId === "addButton") {
              Acuity.noLogs.set(
                `${interaction.guild.id}.${interaction.member.user.id}`,
                true
              );

              const typeRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setCustomId("twitchButton")
                  .setLabel("Twitch Notification")
                  .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                  .setCustomId("youtubeButton")
                  .setLabel("YouTube Notification")
                  .setStyle(ButtonStyle.Primary)
              );

              i.update({
                embeds: [
                  embed(`**Notifications**
                        Which type of notification do you want?     
                        `),
                ],
                components: [typeRow],
              }).then(async (i) => {
                var collector =
                  interaction.channel.createMessageComponentCollector({
                    buttonFilter,
                    time: 30000,
                    max: 1,
                  });
                collector.on("collect", async (i) => {
                  let type = "";

                  if (i.customId === "twitchButton") type = "Twitch";
                  if (i.customId === "youtubeButton") type = "YouTube";
                  i.update({
                    embeds: [
                      embed(`**Notifications**
                                    Which channel do you want get a notification from?
                                    
                                    Please send the link or the name of the **${
                                      type === "Twitch"
                                        ? "Twitch Channel"
                                        : "YouTube Channel"
                                    }**
                                    
                                    Type **Cancel** to cancel.`),
                    ],
                    components: [],
                  }).then(async (i) => {
                    var msgCollector =
                      interaction.channel.createMessageCollector({
                        msgFilter,
                        max: 1,
                      });

                    msgCollector.on("collect", async (collected) => {
                      await collected.delete();

                      if (collected.content.toLowerCase() === "cancel") {
                        interaction.editReply({
                          embeds: [
                            embed(`**Notifications**
                                            You successfully cancelled the notification configurator`),
                          ],
                        });
                        return interaction.fetchReply().then(async (m) => {
                          Acuity.noLogs.set(
                            `${interaction.guild.id}.${interaction.member.user.id}`,
                            false
                          );
                          setTimeout(() => {
                            m.delete();
                          }, 5000);
                        });
                      }
                      let channel = collected.content.split(" ")[0];
                      let channelID =
                        channel
                              .replace("https://", "")
                              .replace("www.", "")
                              .replace("twitch.tv/", "")
                              .replace("youtube.com/", "")
                              .replace("channel/", "");
                              // could have used regex but i am lazy lol


                      if (type === "Twitch") {
                        channel = await twitch.getUsers(channelID)
                        channel = channel.data[0];
                      }
                      if (type === "YouTube") {
                        channel = await youtube.search(channelID, {type: "channel"});
                        channel = channel.channels[0];
                      }

                      if (!channel) {
                        interaction.editReply({
                          embeds: [
                            embed(`**Notifications**
                                  I couldn't find that channel.`),
                          ],
                        });
                        return interaction.fetchReply().then(async (m) => {
                          Acuity.noLogs.set(
                            `${interaction.guild.id}.${interaction.member.user.id}`,
                            false
                          );
                          setTimeout(() => {
                            m.delete();
                          }, 5000);
                        });
                      }

                      interaction
                        .editReply({
                          embeds: [
                            embed(`**Notifications**
                                    Which channel do you want to send the notification to?
                                    
                                    Please tag the channel, send the name of the channel or the channel-id.`),
                          ],
                          components: [],
                        })
                        .then(async (i) => {
                          var msgCollector =
                            interaction.channel.createMessageCollector({
                              msgFilter,
                              max: 1,
                            });

                          msgCollector.on("collect", async (collected) => {
                            await collected.delete();

                            if (collected.content.toLowerCase() === "cancel") {
                              interaction.editReply({
                                embeds: [
                                  embed(`**Notifications**
                                                    You successfully cancelled the notification configurator`),
                                ],
                              });
                              return interaction
                                .fetchReply()
                                .then(async (m) => {
                                  Acuity.noLogs.set(
                                    `${interaction.guild.id}.${interaction.member.user.id}`,
                                    false
                                  );
                                  setTimeout(() => {
                                    m.delete();
                                  }, 5000);
                                });
                            }
                            let notiChannel;

                            if (channelRegex.test(collected.content) === true) {
                              notiChannel =
                                interaction.guild.channels.cache.find(
                                  (c) =>
                                    c.id ===
                                    channelRegex.exec(collected.content)[1]
                                );
                            } else {
                              notiChannel =
                                interaction.guild.channels.cache.find(
                                  (c) =>
                                    c.id === collected.content ||
                                    c.name === collected.content
                                );
                            }

                            if (!notiChannel) {
                              interaction.editReply({
                                embeds: [
                                  embed(`**Notifications**
                                                      The text-channel was not valid.`),
                                ],
                              });
                              return interaction
                                .fetchReply()
                                .then(async (m) => {
                                  Acuity.noLogs.set(
                                    `${interaction.guild.id}.${interaction.member.user.id}`,
                                    false
                                  );
                                  setTimeout(() => {
                                    m.delete();
                                  }, 5000);
                                });
                            }

                            if (!interaction.guild.members.me.permissionsIn(notiChannel).has(PermissionFlagsBits.ManageWebhooks))
                              return interaction
                                .editReply({
                                  embeds: [embed(`**Notifications**
                                  I do not have access to manage webhooks in <#${notiChannel.id}>.
                                  
                                  Please let me be able to manage webhooks before trying again`)],
                                })
                                .then((m) =>
                                  interaction.fetchReply().then(async (m) =>
                                    setTimeout(() => {
                                      m.delete();
                                    }, 5000)
                                  )
                                );

                            const typeRow =
                              new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                  .setCustomId("removeButton")
                                  .setLabel("Remove notification")
                                  .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                  .setCustomId("dontRemoveButton")
                                  .setLabel("Do not remove notification")
                                  .setStyle(ButtonStyle.Primary)
                              );

                              interaction.editReply({
                              embeds: [
                                embed(`**Notifications**
                                            Do you want me to remove the stream-notification if a stream is over?   
                                            `),
                              ],
                              components: [typeRow],
                            }).then(async (i) => {
                              collector = interaction.channel.createMessageComponentCollector(
                                  {
                                    buttonFilter,
                                    time: 30000,
                                    max: 1,
                                  }
                                );
                              collector.on("collect", async (i) => {
                                let remove =
                                  i.customId === "removeButton" ? true : false;

                                const mentionRow =
                                  new ActionRowBuilder().addComponents(
                                    new ButtonBuilder()
                                      .setCustomId("addMentionButton")
                                      .setLabel("Add Mention")
                                      .setStyle(ButtonStyle.Primary),
                                    new ButtonBuilder()
                                      .setCustomId("noMentionButton")
                                      .setLabel("Do not mention")
                                      .setStyle(ButtonStyle.Primary)
                                  );

                                i.update({
                                  embeds: [
                                    embed(`**Notifications**
                                                Do you want me to mention a role when they start to stream or upload a video?
                                                `),
                                  ],
                                  components: [mentionRow],
                                }).then(async (i) => {
                                  collector =
                                    interaction.channel.createMessageComponentCollector(
                                      {
                                        buttonFilter,
                                        time: 30000,
                                        max: 1,
                                      }
                                    );
                                  collector.on("collect", async (i) => {
                                    if (i.customId === "noMentionButton") {
                                      let channelPfp;

                                      if (type === "YouTube") {
                                        channelPfp =
                                          channel.thumbnail;
                                      } else if (type === "Twitch") {
                                        channelPfp = channel.profile_image_url;
                                      }

                                      interaction.editReply({
                                        embeds: [
                                          embed(`**Notifications**
                                                The notification has been created.
                                                
                                                Channel - **${
                                                  type === "YouTube"
                                                    ? channel.name
                                                    : channel.display_name
                                                }**
                                                Notification Channel - **${
                                                  notiChannel.name
                                                }**
                                                Type - **${type}**
                                                Mentions - **None**
                                                Remove Stream Message - **${remove ? "Yes" : "No"}**
                                                
                                                `),
                                        ],
                                      });

                                      notiChannel
                                        .createWebhook({
                                          name: `${
                                            type === "YouTube"
                                              ? channel.name
                                              : channel.display_name
                                          } - ${type} Notification`,
                                          avatar: channelPfp,
                                        })
                                        .then(async (webhook) => {
                                          Acuity.noLogs.set(
                                            `${interaction.guild.id}.${interaction.member.user.id}`,
                                            false
                                          );

                                          let newNoti = new notifications({
                                            latest: "",
                                            webhook: webhook.url,
                                            type: type,
                                            channel:
                                              type === "YouTube"
                                                ? channel.channel_id
                                                : channel.id,
                                            guildID: interaction.guild.id,
                                            roleToMention: null,
                                            streaming: {
                                              isStreaming: false,
                                              removeWhenDone: remove,
                                              messageID: null,
                                            },
                                          });

                                          return newNoti
                                            .save()
                                            .catch((err) => console.log(err));
                                        });
                                    }

                                    if (i.customId === "addMentionButton") {
                                      interaction
                                        .editReply({
                                          embeds: [
                                            embed(`**Notifications**
                                    Which role do you want to mention?
                                    
                                    Please tag the role, send the name of the role or the role-id.`),
                                          ],
                                          components: [],
                                        })
                                        .then(async (i) => {
                                          var msgCollector =
                                            interaction.channel.createMessageCollector(
                                              {
                                                msgFilter,
                                                max: 1,
                                              }
                                            );

                                          msgCollector.on(
                                            "collect",
                                            async (collected) => {
                                              await collected.delete();

                                              if (
                                                collected.content.toLowerCase() ===
                                                "cancel"
                                              ) {
                                                interaction.editReply({
                                                  embeds: [
                                                    embed(`**Notifications**
                                                    You successfully cancelled the notification configurator`),
                                                  ],
                                                });
                                                return interaction
                                                  .fetchReply()
                                                  .then(async (m) => {
                                                    Acuity.noLogs.set(
                                                      `${interaction.guild.id}.${interaction.member.user.id}`,
                                                      false
                                                    );
                                                    setTimeout(() => {
                                                      m.delete();
                                                    }, 5000);
                                                  });
                                              }
                                              let mentionRole;

                                              if (
                                                roleRegex.test(
                                                  collected.content
                                                ) === true
                                              ) {
                                                mentionRole =
                                                  interaction.guild.roles.cache.find(
                                                    (c) =>
                                                      c.id ===
                                                      roleRegex.exec(
                                                        collected.content
                                                      )[1]
                                                  );
                                              } else {
                                                mentionRole =
                                                  interaction.guild.roles.cache.find(
                                                    (c) =>
                                                      c.id ===
                                                        collected.content ||
                                                      c.name ===
                                                        collected.content
                                                  );
                                              }

                                              if (!notiChannel) {
                                                interaction.editReply({
                                                  embeds: [
                                                    embed(`**Notifications**
                                                                        The role was not valid.`),
                                                  ],
                                                });
                                                return interaction
                                                  .fetchReply()
                                                  .then(async (m) => {
                                                    Acuity.noLogs.set(
                                                      `${interaction.guild.id}.${interaction.member.user.id}`,
                                                      false
                                                    );
                                                    setTimeout(() => {
                                                      m.delete();
                                                    }, 5000);
                                                  });
                                              }

                                              let channelPfp;

                                              if (type === "YouTube") {
                                                channelPfp =
                                                  channel.channel_avatar_large.replace(
                                                    "/ytc/t3.ggpht.com/",
                                                    "/"
                                                  );
                                              } else if (type === "Twitch") {
                                                channelPfp =
                                                  channel.profile_image_url;
                                              }

                                              interaction.editReply({
                                                embeds: [
                                                  embed(`**Notifications**
                                                The notification has been created.
                                                
                                                Channel - **${
                                                  type === "YouTube"
                                                    ? channel.name
                                                    : channel.display_name
                                                }**
                                                Notification Channel - **${
                                                  notiChannel.name
                                                }**
                                                Type - **${type}**
                                                Mentions - <@&${mentionRole.id}>
                                                Remove Stream Message - **${remove ? "Yes" : "No"}**`),
                                                ],
                                              });

                                              notiChannel
                                                .createWebhook({
                                                  name: `${
                                                    type === "YouTube"
                                                      ? channel.name
                                                      : channel.displayName
                                                  } - ${type} Notification`,
                                                  avatar: channelPfp,
                                                })
                                                .then(async (webhook) => {
                                                  Acuity.noLogs.set(
                                                    `${interaction.guild.id}.${interaction.member.user.id}`,
                                                    false
                                                  );

                                                  let newNoti =
                                                    new notifications({
                                                      latest: "",
                                                      webhook: webhook.url,
                                                      type: type,
                                                      channel:
                                                        channel.id,
                                                      guildID:
                                                        interaction.guild.id,
                                                      roleToMention:
                                                        mentionRole.id,
                                                      streaming: {
                                                        isStreaming: false,
                                                        removeWhenDone: remove,
                                                        messageID: null,
                                                      },
                                                    });

                                                  return newNoti
                                                    .save()
                                                    .catch((err) =>
                                                      console.log(err)
                                                    );
                                                });
                                            }
                                          );
                                        });
                                    }
                                  });
                                });
                              });
                            });
                          });
                        });
                    });
                  });
                });
              });
            }

            if (i.customId === "listButton") {
              await i.update({
                embeds: [
                  embed(`**Notifications**
                        Loading notifications...`),
                ],
                components: [],
              });

              await notifications.find(
                { guildID: interaction.guild.id },
                async (err, res) => {
                  if (res.length === 0) {
                    return i
                      .editReply({
                        embeds: [
                          embed(`**Notifications**
                              There isn't any notifications.         
                              `),
                        ],
                        components: [],
                      })
                      .then((m) =>
                        interaction.fetchReply().then(async (m) =>
                          setTimeout(() => {
                            m.delete();
                          }, 5000)
                        )
                      );
                  } else {
                    let notiStr = "";

                    for (var x in res) {
                      if (res[x].type === "Twitch") {
                        const body = {
                          client_id: "yojh1yr1ieesk7l5ocul7iebwls649",
                          client_secret: twitchToken,
                          grant_type: "client_credentials",
                        };

                        const response = await fetch(
                          "https://id.twitch.tv/oauth2/token",
                          {
                            method: "post",
                            body: JSON.stringify(body),
                            headers: { "Content-Type": "application/json" },
                          }
                        );
                        const data = await response.json();

                        const api = new ApiClient({
                          authProvider: new StaticAuthProvider(
                            "yojh1yr1ieesk7l5ocul7iebwls649",
                            data.access_token
                          ),
                        });

                        let user = await api.users.getUserById(res[x].channel);
                        notiStr += `**[${user.displayName}](https://twitch.tv/${user.displayName})** - **${res[x].type}** \n`;
                      } else if (res[x].type === "YouTube") {
                        channel = await youtube.search(res[x].channel, {type: "channel"});
                        channel = channel.channels[0];
                        notiStr += `**[${channel.name}](https://youtube.com/channel/${channel.channel_id})** - **${res[x].type}** \n`;
                      }
                    }

                    return i.editReply({
                      embeds: [
                        embed(`**Notifications**
                              These are the current notifications set in the guild.
                              
                              ${notiStr}
                              `),
                      ],
                      components: [],
                    });
                  }
                }
              );
            }
          });
        });
      });
  },
};
