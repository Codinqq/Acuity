let { embed } = require("../../Utils/Embeds");
const moment = require("moment");
const {
  SlashCommandBuilder,
  ChannelType,
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  InteractionCollector,
  InteractionType,
  TextInputStyle,
  PermissionFlagsBits,
} = require("discord.js");
let { mainColor } = require("../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tickets")
    .setDescription("Open, and close tickets.")
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand.setName("create").setDescription("Create an ticket")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("close")
        .setDescription("Close the ticket")
        .addUserOption((options) =>
          options
            .setName("user")
            .setDescription("The user's ticket you want to remove.")
        )
        .addStringOption((options) =>
          options
            .setName("reason")
            .setDescription("The reason you want to remove the ticket")
        )
    ),
  execute: async (Acuity, interaction) => {

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return interaction
          .reply({
            embeds: [
              embed(`**Tickets**
              I do not have access to manage channels.
              
              Please let me be able to manage channels before trying again`),
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

    if (interaction.options.getSubcommand() === "create") {
      const ticketModal = new ModalBuilder()
        .setCustomId("ticketModal")
        .setTitle("Tickets");
      const messageInput = new TextInputBuilder()
        .setCustomId("ticketMessage")
        .setLabel("Message")
        .setStyle(TextInputStyle.Short)
        .setMaxLength(2000)
        .setRequired(true);

      const messageActionRow = new ActionRowBuilder().addComponents(
        messageInput
      );

      ticketModal.addComponents(messageActionRow);

      await interaction.showModal(ticketModal).then(async (modal) => {
        const modal_collector = new InteractionCollector(Acuity, {
          interactionType: InteractionType.ModalSubmit,
          max: 1,
        });

        modal_collector.on("collect", async (modal_col) => {
          let message = modal_col.fields.getTextInputValue("ticketMessage");

          let categoryChannel = interaction.guild.channels.cache.find(
            (cat) =>
              cat.name === "Tickets" && cat.type === ChannelType.GuildCategory
          );

          if (!categoryChannel) {
            interaction.guild.channels
              .create({
                name: "Tickets",
                type: ChannelType.GuildCategory,
                reason: "Acuity - Ticket-Category not found",
              })
              .then(async (ticketCategory) => {
                categoryChannel = ticketCategory;
              });
          }

          let staffRole = await interaction.guild.roles.cache.find(
            (r) => r.name === "Staff"
          );

          if (!staffRole) {
            await interaction.guild.roles
              .create({
                name: "Staff",
                color: mainColor,
                reason: "Acuity - Setup-Command",
              })
              .then(async (s) => {
                staffRole = await interaction.guild.roles.cache.find(
                  (r) => r.id === s.id
                );
              });
          }

          let ticketChannel = interaction.guild.channels.cache.find(
            (channel) => channel.name === `ticket-${interaction.user.id}`
          );

          if (!ticketChannel) {
            interaction.guild.channels
              .create({
                name: `ticket-${interaction.user.id}`,
                type: ChannelType.GuildText,
                reason: "Acuity - Ticket-Channel created",
                permissionOverwrites: [
                    {
                        id: interaction.guildId,
                        deny: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory]
                    },
                    {
                        id: staffRole.id,
                        allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory]
                    },
                    {
                        id: interaction.member.user.id,
                        allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory]
                    },
                ]
              })
              .then(async (ticketChannel) => {
                ticketChannel.setParent(categoryChannel, {lockPermissions: false});

                modal_col.reply({
                  embeds: [
                    embed(`**Tickets**                                
                                    Your ticket has been created!`),
                  ],
                  ephemeral: true,
                });

                ticketChannel
                  .send({
                    embeds: [
                      embed(`**Tickets**                                
                                        **${
                                          interaction.user.username +
                                          "#" +
                                          interaction.user.discriminator
                                        }** needs help!
                                        
                                        Message -> \`${message}\`
                                        `),
                    ],
                  })
                  .then((message) => message.pin());
              });
          } else {
            ticketChannel
              .send({
                embeds: [
                  embed(`**Tickets**
                                    **${
                                      interaction.user.username +
                                      "#" +
                                      interaction.user.discriminator
                                    }** needs help!

                                    Message -> \`${message}\`
                                    `),
                ],
              })
              .then((message) => message.pin());

            modal_col.reply({
              embeds: [
                embed(`**Tickets**                                
                                    Your ticket has been created!`),
              ],
              ephemeral: true,
            });
          }
        });
      });
    }

    if (interaction.options.getSubcommand() === "close") {
      let userMember = interaction.options.getMember("user");

      if (
        userMember &&
        interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)
      ) {
        let ticketChannel = interaction.guild.channels.cache.find(
          (cat) =>
            cat.name === `ticket-${userMember.id}` && cat.type === ChannelType.GuildText
        );
        if (!ticketChannel) {
          return interaction.reply({
            embeds: [
              embed(`**Tickets**
                          Couldn't find any tickets from **${
                            userMember.user.username +
                            "#" +
                            userMember.user.discriminator
                          }**`),
            ],
            ephemeral: true,
          });
        }

        let reason = interaction.options.getString("reason");

        userMember.send({
          embeds: [
            embed(`**Tickets**
                          Your ticket in **${interaction.guild.name}**[\`${
              interaction.guild.id
            }\`] was successfully closed by **${
              interaction.user.username + "#" + interaction.user.discriminator
            }**.

            Reason -> \`${reason ? reason : "No reason specified"}**`),
          ],
        });

        interaction.reply({
          embeds: [
            embed(`**Tickets**                                
                          **${
                            userMember.user.username +
                            "#" +
                            userMember.user.discriminator
                          }**'s ticket was successfully removed!`),
          ],
          ephemeral: true,
        });

        ticketChannel.delete();
    } else if(interaction.member.permissions.has(PermissionFlagsBits.ManageChannels) && interaction.channel.name.includes("ticket-")) {

        let ticketChannel = interaction.channel;
        
          let reason = interaction.options.getString("reason");

          let userMember = interaction.guild.members.cache.find(c => c.id === (interaction.channel.name.replace("ticket-", "")));

          if(userMember) {
            userMember.send({
                embeds: [
                  embed(`**Tickets**
                                Your ticket in \`${interaction.guild.name}\` [\`${
                    interaction.guild.id
                  }\`] was successfully closed by \`${
                    interaction.user.username + "#" + interaction.user.discriminator
                  }\`.
      
                  Reason -> \`${reason ? reason : "No reason specified"}\``),
                ],
              });

              interaction.reply({
                embeds: [
                  embed(`**Tickets**                                
                                **${
                                  userMember.user.username +
                                  "#" +
                                  userMember.user.discriminator
                                }**'s ticket was successfully removed!`),
                ],
                ephemeral: true,
              });
          } else {
            interaction.reply({
                embeds: [
                  embed(`**Tickets**                                
                                **${interaction.channel.name.replace("ticket-", "")}**'s ticket was successfully removed!`),
                ],
                ephemeral: true,
              });
          }

          ticketChannel.delete();

    } else {
        let ticketChannel = interaction.guild.channels.cache.find(
          (cat) =>
            cat.name === `ticket-${interaction.user.id}` &&
            cat.type === ChannelType.GuildText
        );
        if (!ticketChannel) {
          return interaction.reply({
            embeds: [
              embed(`**Tickets**
                          You don't have any tickets.`),
            ],
            ephemeral: true,
          });
        }

        interaction.reply({
          embeds: [
            embed(`**Tickets**
                      Your ticket was successfully closed.`),
          ],
          ephemeral: true,
        });

        ticketChannel.delete();
    }
    }
  },
};
