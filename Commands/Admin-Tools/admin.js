let { getGuild, getUser, getAdmin } = require("../../Utils/Database");
let { embed } = require("../../Utils/Embeds");

const moment = require("moment");
require("moment-duration-format");
const util = require("util");
const OS = require("os");
const pretty = require("prettysize");
const config = require("../../config.json");
const hastebin = require("hastebin-gen");
const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ModalBuilder,
  ButtonStyle,
  TextInputStyle,
  InteractionType,
  TextInputBuilder,
  InteractionCollector,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("admin")
    .setDescription("Admin Tools for Bot-Moderators")
    .setDMPermission(false)
    .addSubcommand((subCommand) =>
      subCommand.setName("eval").setDescription("Evaluate some javascript code")
    )
    .addSubcommand((subCommand) =>
      subCommand.setName("leave").setDescription("Make Acuity leave a server")
    )
    .addSubcommand((subCommand) =>
      subCommand
        .setName("ban")
        .setDescription("Make Acuity not able to join a server")
    )
    .addSubcommand((subCommand) =>
      subCommand
        .setName("unban")
        .setDescription("Make Acuity able to join a banned server")
    )
    .addSubcommand((subCommand) =>
      subCommand
        .setName("help")
        .setDescription("Get help about the admin panel")
    )
    .addSubcommand((subCommand) =>
      subCommand
        .setName("badges")
        .setDescription("Add or remove badges")
        .addStringOption((option) =>
          option
            .setName("badgeuserid")
            .setDescription("The user you want to add a badge to.")
            .setRequired(true)
        )
    )
    .addSubcommand((subCommand) =>
      subCommand
        .setName("disable")
        .setDescription("Disable or enable commands")
        .addStringOption((option) =>
          option
            .setName("commands")
            .setDescription("The command you want to disable/enable. Multiple Commands: use comma between the names: bot, guild")
            .setRequired(true)
        )
    )
    .addSubcommand((subCommand) =>
      subCommand.setName("stats").setDescription("Get Acuity Stats")
    )
    .addSubcommand((subCommand) =>
      subCommand
        .setName("maintenance")
        .setDescription("Set Acuity to maintenance")
    )
    .addSubcommand((subCommand) =>
      subCommand
        .setName("changeactivity")
        .setDescription("Change Acuity's activity")
        .addStringOption((option) =>
          option
            .setName("activitystatus")
            .addChoices(
              { name: "Online", value: "online" },
              { name: "Idle", value: "idle" },
              { name: "DND", value: "dnd" },
              { name: "Invisible", value: "invisible" }
            )
            .setDescription("Change what Acuity's status would be.")

        )
        .addStringOption((option) =>
          option
            .setName("activitytype")
            .addChoices(
              { name: "Playing", value: "0" },
              { name: "Streaming", value: "1" },
              { name: "Listening", value: "2" },
              { name: "Watching", value: "3" },
              { name: "Competing", value: "5" }
            )
            .setDescription("The type of presence to display.")
        )
        .addStringOption((option) =>
          option.setName("activitymessage").setDescription("The message to be displayed on the activity")
        )
    ),
  async execute(Acuity, interaction) {

    var userInfo = await getUser(interaction.user.id);
    var adminSettings = await getAdmin();

    if (
      userInfo.settings.badges.botDev === false &&
      userInfo.settings.badges.botMod === false
    ) {
      return interaction
        .reply({
          embeds: [
            embed(`**Admin Panel**  
              You do not have access to this command, as it is only for people that are administating Acuity!`),
          ],
          ephemeral:true
        })
        .then((m) =>
          interaction.fetchReply().then((m) => {
            setTimeout(() => {
              m.delete();
            }, 3000);
          })
        );
    }

    if (interaction.options.getSubcommand() === "stats") {
      return await interaction.deferReply()
        .then(() => {
          interaction.fetchReply().then((m) => {
            const duration = moment
              .duration(Acuity.uptime)
              .format(" D [days], H [hrs], m [mins], s [sec]");
            return interaction.editReply({
              embeds: [
                embed(`**Admin Panel**  ─    
                  **Performance**
                  Latency - **${Math.floor(
                    m.createdTimestamp - interaction.createdTimestamp
                  )}ms**
                  API Latency - **${Math.round(Acuity.ws.ping)}ms**
                  
                  **Instance Stats**
                  Uptime - **${duration}**
                  Free Memory - **${pretty(OS.freemem())}/${pretty(
                  OS.totalmem()
                )}**

                  To view the admin commands - \`/admin help\`
                `),
              ],
              ephemeral:true
            });
          });
        });
    }
    if (interaction.options.getSubcommand() === "eval") {
      if (
        userInfo.settings.badges.botDev === false
      ) {
        return interaction.reply({
          embeds: [
            embed(`**Admin Panel**  
                You do not have access to this command as it is only for Bot Developers.`),
          ],
          ephemeral: true,
        });
      }
      const evalModal = new ModalBuilder()
        .setCustomId("evalModal")
        .setTitle("Evaluate  ─");

      const codeInput = new TextInputBuilder()
        .setCustomId("evalCode")
        .setLabel("Code to Evaluate")
        .setStyle(TextInputStyle.Paragraph)
        .setMaxLength(4000);

      const serverActionRow = new ActionRowBuilder().addComponents(codeInput);

      evalModal.addComponents(serverActionRow);

      await interaction.showModal(evalModal).then(async (modal) => {
        const modal_collector = new InteractionCollector(Acuity, {
          interactionType: InteractionType.ModalSubmit,
          max: 1,
        });

        modal_collector.on("collect", async (modal_col) => {
          let evalCode = modal_col.fields.getTextInputValue("evalCode");
          try {
            if (!evalCode)
              return interaction
                .reply({
                  embeds: [
                    embed(`**Admin Panel**
                  You didn't specify anything to evaluate!`),
                  ],
                  ephemeral:true
                })
                .then((m) =>
                  interaction.fetchReply().then((m) => {
                    setTimeout(() => {
                      m.delete();
                    }, 3000);
                  })
                );

            let hrStart = process.hrtime();
            let hrDiff;

            let evaled = util.inspect(
              eval(evalCode, {
                depth: 0,
              })
            );

            hrDiff = process.hrtime(hrStart);

            if (evalCode.length > 2000) {
              evalCode = `[${hastebin(evalCode, {
                extension: "js",
              })}](Go to code)`;
            } else {
              evalCode = "```js\n" + evalCode + "\n```";
            }
            if (evaled.length > 2000) {
              evaled = `[${hastebin(evaled, {
                extension: "js",
              })}](Go to returned code)`;
            } else {
              evaled = "```js\n" + evaled + "\n```";
            }

            return modal_col.reply({
              embeds: [
                embed(`**Admin Panel**  ─
              Executed in > \`${hrDiff[0] > 0 ? `${hrDiff[0]}s` : ""}${
                  hrDiff[1] / 1000000
                }ms.\`
              Code 
              ${evalCode}
              Evaluated
              ${evaled}`),
              ],
              ephemeral:true
            });
          } catch (e) {
            modal_col.reply({
              embeds: [embed("**Error**\n```" + e.stack + "```")],
              ephemeral:true
            });
          }
        });
      });
    }
    if (interaction.options.getSubcommand() === "leave") {
      const leaveModal = new ModalBuilder()
        .setCustomId("serverLeaveModal")
        .setTitle("Server Leave  ─");

      const serverInput = new TextInputBuilder()
        .setCustomId("serverid")
        .setLabel("Server-ID")
        .setStyle(TextInputStyle.Short);

      const serverActionRow = new ActionRowBuilder().addComponents(serverInput);

      leaveModal.addComponents(serverActionRow);

      await interaction.showModal(leaveModal).then(async (modal) => {
        const modal_collector = new InteractionCollector(Acuity, {
          interactionType: InteractionType.ModalSubmit,
          max: 1,
        });

        modal_collector.on("collect", async (modal_col) => {
          let serverID = modal_col.fields.getTextInputValue("serverid");

          if (!isNaN(serverID)) {
            let guild = Acuity.guilds.cache.find((g) => g.id === serverID);

            if (!guild) {
              return interaction.reply({
                embeds: [
                  embed(`**Admin Panel**  ─
                  I'm not in that guild, or you specified the wrong id!`),
                ],
                ephemeral: true,
              });
            } else {
              guild.leave();
              return interaction.reply({
                embeds: [
                  embed(`**Admin Panel**  ─
                  I successfully left \`${guild.name}\`(\`${guild.id}\`)!`),
                ],
                ephemeral: true,
              });
            }
          } else {
            return interaction.reply({
              embeds: [
                embed(`**Admin Panel**  ─
                You'll need to specify a valid guild-id`),
              ],
              ephemeral: true,
            });
          }
        });
      });
    }
    if (interaction.options.getSubcommand() === "badges") {
      let userID = interaction.options._hoistedOptions.find(
        (c) => c.name === "badgeuserid"
      ).value;
      if (
        userInfo.settings.badges.botDev === false &&
        userInfo.settings.badges.botMod === true
      ) {
        return interaction
          .reply({
            embeds: [
              embed(`**Admin Panel**  
                You do not have access to this command as it is only for Bot Developers.`),
            ],
            ephemeral:true
          })
          .then((m) =>
            interaction.fetchReply().then((m) => {
              setTimeout(() => {
                m.delete();
              }, 3000);
            })
          );
      }
      let verifiedPartner = "Partner";
      let botDev = "Bot Dev";
      let botMod = "Bot Mod";

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("verifiedpartner")
          .setLabel(verifiedPartner)
          .setStyle(ButtonStyle.Success)
          .setEmoji("✅"),
        new ButtonBuilder()
          .setCustomId("botdev")
          .setLabel(botDev)
          .setStyle(ButtonStyle.Danger)
          .setEmoji("🔧"),
        new ButtonBuilder()
          .setCustomId("botmod")
          .setLabel(botMod)
          .setStyle(ButtonStyle.Primary)
          .setEmoji("🛡️")
      );

      return interaction
        .reply({
          embeds: [
            embed(`**Admin Panel**  ─
              You have to respond with an userID, or this command won't work.`),
          ],
          components: [row],
          ephemeral:true
        })
        .then((reply) => {
          interaction.fetchReply().then(async (msg) => {
            var userDB = await getUser(userID);

            if (!userDB) {
              return interaction
                .editReply({
                  embeds: [
                    embed(`**Admin Panel**  ─
                      I couldn't find any databases where the userID was **${userID}**`),
                  ],
                  ephemeral:true
                })
                .then((m) =>
                  interaction.fetchReply().then((m) => {
                    setTimeout(() => {
                      m.delete();
                    }, 3000);
                  })
                );
            }
            return interaction
              .editReply({
                embeds: [
                  embed(`**Admin Panel**  ─
                    You're currently editing **${userID}**'s badges.`),
                ],
                ephemeral:true
              })
              .then(async (msgEmbed) => {
                interaction.fetchReply().then(async (msg) => {
                  const filter = (i) => i.user.id === "740213771179524187";

                  const collector = msg.createMessageComponentCollector({
                    filter,
                    time: 30000,
                  });

                  collector.on("collect", async (i) => {
                    if (i.customId === "verifiedpartner") {
                      i.update({
                        embeds: [
                          embed(`**Admin Panel**  ─
                            I successfully ${
                              userDB.settings.badges.verifiedPartner
                                ? "removed"
                                : "added"
                            } \`${verifiedPartner}\` ${
                            userDB.settings.badges.verifiedPartner
                              ? "fom"
                              : "to"
                          } ${userID}`),
                        ],
                        ephemeral:true
                      });
                      userDB.settings.badges.verifiedPartner =
                        !userDB.settings.badges.verifiedPartner;
                      userDB.save().catch((err) => console.log(err));
                    } else if (i.customId === "botdev") {
                      i.update({
                        embeds: [
                          embed(`**Admin Panel**  ─
                            I successfully ${
                              userDB.settings.badges.botDev
                                ? "removed"
                                : "added"
                            } \`${botDev}\` ${
                            userDB.settings.badges.botDev ? "from" : "to"
                          } ${userID}`),
                        ],
                        ephemeral:true
                      });
                      userDB.settings.badges.botDev =
                        !userDB.settings.badges.botDev;
                      userDB.save().catch((err) => console.log(err));
                    } else if (i.customId === "botmod") {
                      i.update({
                        embeds: [
                          embed(`**Admin Panel**  ─
                            I successfully ${
                              userDB.settings.badges.botMod
                                ? "removed"
                                : "added"
                            } \`${botMod}\` ${
                            userDB.settings.badges.botMod ? "from" : "to"
                          } ${userID}`),
                        ],
                        ephemeral:true
                      });
                      userDB.settings.badges.botMod =
                        !userDB.settings.badges.botMod;
                      userDB.save().catch((err) => console.log(err));
                    }
                  });
                });
              });
          });
        });
    }
    if (interaction.options.getSubcommand() === "ban") {
      const banModal = new ModalBuilder()
        .setCustomId("banModal")
        .setTitle("Server Ban  ─");

      const serverInput = new TextInputBuilder()
        .setCustomId("serverid")
        .setLabel("Server-ID")
        .setStyle(TextInputStyle.Short);

      const reasonInput = new TextInputBuilder()
        .setCustomId("banreason")
        .setLabel("Ban Reason")
        .setStyle(TextInputStyle.Paragraph)
        .setMaxLength(100);

      const serverActionRow = new ActionRowBuilder().addComponents(serverInput);
      const reasonActionRow = new ActionRowBuilder().addComponents(reasonInput);

      banModal.addComponents(serverActionRow, reasonActionRow);

      await interaction.showModal(banModal).then(async (modal) => {
        const modal_collector = new InteractionCollector(Acuity, {
          interactionType: InteractionType.ModalSubmit,
          max: 1,
        });

        modal_collector.on("collect", async (modal_col) => {
          let serverID = modal_col.fields.getTextInputValue("serverid");
          let banReason = modal_col.fields.getTextInputValue("banreason");

          let guildDB = await getGuild(serverID);

          guildDB.settings.blacklist.blacklisted = true;
          guildDB.settings.blacklist.reason = banReason;
          guildDB.settings.blacklist.blacklister =
            interaction.user.username + "#" + interaction.user.discriminator;

          let guild = Acuity.guilds.cache.find((g) => g.id === serverID);

          guild.leave();

          modal_col.reply({
            embeds: [
              embed(`**Server Ban**  ─
          Server \`${guild.name}\` was banned from using Acuity.
          Reason > \`${banReason}\``),
            ],
            ephemeral:true
          });

          return guildDB.save().catch((err) => console.log(err));
        });
      });
    }
    if (interaction.options.getSubcommand() === "unban") {
      const unbanModal = new ModalBuilder()
        .setCustomId("unbanModal")
        .setTitle("Server Unban  ─");

      const serverInput = new TextInputBuilder()
        .setCustomId("serverid")
        .setLabel("Server-ID")
        .setStyle(TextInputStyle.Short);

      const serverActionRow = new ActionRowBuilder().addComponents(serverInput);

      unbanModal.addComponents(serverActionRow);

      await interaction.showModal(unbanModal).then(async (modal) => {
        const modal_collector = new InteractionCollector(Acuity, {
          interactionType: InteractionType.ModalSubmit,
          max: 1,
        });

        modal_collector.on("collect", async (modal_col) => {
          let serverID = modal_col.fields.getTextInputValue("serverid");

          let guildDB = await getGuild(serverID);

          guildDB.settings.blacklist.blacklisted = false;
          guildDB.settings.blacklist.reason = "";
          guildDB.settings.blacklist.blacklister = "";

          modal_col.reply({
            embeds: [
              embed(`**Server Unban**  ─
          Server \`${serverID}\` now has access to Acuity.`),
            ],
            ephemeral:true
          });

          return guildDB.save().catch((err) => console.log(err));
        });
      });
    }
    if (interaction.options.getSubcommand() === "help") {
      return interaction.reply({
        embeds: [
          embed(`**Admin Panel**  ─
            **Bot-Moderators**
            Ban - \`/admin ban\` - **Ban a guild, so they can't invite the bot.**
            Unban - \`/admin unban\` - **Make a guild able to use Acuity**
            Leave - \`/admin leave\` - **Make Acuity leave a guild**
            Change Activity - \`/admin changeactivity\` - **Change Acuitys current Activity**

            **Bot-Developer**
            Badges - \`/admin badges\` - **Add or remove badges to/from people**
            Eval - \`/admin eval\` - **Evaluate Node.js code**
            Disable - \`/admin disable\` - **Disable broken/unstable commands.**

          `),
        ],
        ephemeral:true
      });
    }
    if (interaction.options.getSubcommand() === "maintenance") {
      if (
        userInfo.settings.badges.botDev === false &&
        userInfo.settings.badges.botMod === true
      ) {
        return interaction.reply({
          embeds: [
            embed(`**Admin Panel**  
                You do not have access to this command as it is only for Bot Developers.`),
          ],
          ephemeral: true,
        });
      }

      adminSettings.isInMaintenance = !adminSettings.isInMaintenance;

      adminSettings.save().catch((err) => console.log(err));

      if(adminSettings.isInMaintenance) Acuity.user.setPresence({status: "dnd", activities: [{type: 0, name: "Maintenance Mode"}]});
      if(!adminSettings.isInMaintenance) Acuity.user.setPresence({status: adminSettings.status.status, activities: [{type: adminSettings.status.activity, name: adminSettings.status.message.replaceAll('[VERSION]', config.version), url: "https://www.twitch.tv/codinq"}]});


      return interaction.reply({
        embeds: [
          embed(`**Admin Panel**  ─
            Acuity is ${
              adminSettings.isInMaintenance
                ? "**now in maintenance**"
                : "**no longer in maintenance**"
            }
          `),
        ],
        ephemeral:true
      });
    }
    if (interaction.options.getSubcommand() === "changeactivity") {

      let status = interaction.options.getString("activitystatus");
      let type = Number(interaction.options.getString("activitytype"));
      let message = interaction.options.getString("activitymessage");

      adminSettings.status.message = message !== null ? message : adminSettings.status.message;
      adminSettings.status.activity = type !== null ? type : adminSettings.status.activity;
      adminSettings.status.status = status !== null ? status : adminSettings.status.status;
      adminSettings.save().catch(err => console.log(err));

      Acuity.user.setPresence({status: adminSettings.status.status, activities: [{type: adminSettings.status.activity, name: adminSettings.status.message.replaceAll('[VERSION]', config.version), url: "https://www.twitch.tv/codinq"}]})

      let types = ["Playing", "Streaming", "Watching", "Custom", "Competing"];


      return interaction.reply({
        embeds: [
          embed(`**Admin Panel**  ─
            Successfully changed Acuity's presence.

            Message - **${adminSettings.status.message}**
            Type - **${types[adminSettings.status.activity]}**
            Status - **${adminSettings.status.status}**

          `),
        ],
        ephemeral:true
      });

    }
    if(interaction.options.getSubcommand() === "disable") {

      await interaction.deferReply();

      if (
        userInfo.settings.badges.botDev === false &&
        userInfo.settings.badges.botMod === true
      ) {
        return interaction
          .editReply({
            embeds: [
              embed(`**Admin Panel**  
                You do not have access to this command as it is only for Bot Developers.`),
            ],
            ephemeral:true
          })
          .then((m) =>
            interaction.fetchReply().then((m) => {
              setTimeout(() => {
                m.delete();
              }, 3000);
            })
          );
      }
      
      let commandList = interaction.options.getString("commands");
      commandList = commandList.split(", ");

      var enabledCommands = "";
      var disabledCommands = "";
      var unsuccessfullCommands = "";

      for(var x in commandList) {

        let commandFile = Acuity.commands.get(commandList[x]);

        if(!commandFile || commandFile === undefined) {
          return unsuccessfullCommands += commandList[x] + " ";
        }

        if(adminSettings.disabled.commands.includes(commandList[x])) {

          let commandIndex = adminSettings.disabled.commands.indexOf(commandList[x]);

          adminSettings.disabled.commands.splice(commandIndex, 1);

          enabledCommands += commandList[x] + " ";
        } else {
          adminSettings.disabled.commands.push(commandList[x]);
          disabledCommands += commandList[x] + " ";
        }
      }

      await adminSettings.save().catch(err => {});
      return await interaction.editReply({
        embeds: [
          embed(`**Admin Panel**  ─
            
          Commands successfully enabled
          \`${enabledCommands ? enabledCommands : "None"}\`

          Commands successfully disabled
          \`${disabledCommands ? disabledCommands : "None"}\`

          Commands that doesn't exist
          \`${unsuccessfullCommands ? unsuccessfullCommands : "None"}\`

          `),
        ],
        ephemeral:true
      });


    
    }

    
  },
};
