const {
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");
let { embed, noPerms } = require("../../Utils/Embeds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("announce")
    .setDescription("Announce something to the guild")
    .addBooleanOption((option) =>
      option
        .setName("currentchannel")
        .setDescription("Announce this in the current channel")
        .setRequired(false)
    )
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  execute: async (Acuity, interaction) => {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages))
      return interaction.reply({
        embeds: [noPerms("Manage Messages")],
        ephemeral: true,
      });

    const msgFilter = (m) => m.author.id === interaction.member.user.id;

    interaction
      .reply({
        embeds: [
          embed(`**Announcement**
      What do you want the announcement to be?`),
        ],
        ephemeral: true,
      })
      .then((msg) => {
        Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,true)

        var msgCollector = interaction.channel.createMessageCollector({
          msgFilter,
          max: 1,
        });

        msgCollector.on("collect", async (collected) => {
          let announcement = collected.content;
          collected.delete();

          if (interaction.options.getBoolean("currentchannel") === true) {
            interaction.channel.send({
              content: "@everyone",
              embeds: [
                embed(
                  `**Announcement** \n` + announcement
                ).setFooter({
                  text: `Announcement by ${
                    interaction.user.username +
                    "#" +
                    interaction.user.discriminator
                  }`,
                }),
              ],
            }).then(() => Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false));
          } else {
            let channel = interaction.guild.channels.cache.find(
              (c) => c.name === "announcements"
            );

            if (!channel) {
              return interaction.channel.send({
                content: "@everyone",
                embeds: [
                  embed(
                    `**Announcement** \n` + announcement
                  ).setFooter({
                    text: `Announcement by ${
                      interaction.user.username +
                      "#" +
                      interaction.user.discriminator
                    }`,
                  }),
                ],
              }).then(() => Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false));
            }

            if (
              !interaction.guild.members.me.permissions
                .has(channel)
                .has("SEND_MESSAGES")
            ) {
              return interaction.editReply({
                embeds: [
                  embed(`**Announcement**            
                    I do not have permission to write in the #announcements channel
                    
                    Please let me write in the #announcements channel before trying again.`),
                ],
                ephemeral: true,
              }).then(() => Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false));
            }

            interaction.editReply({
              embeds: [
                embed(
                  `**Announcement**\nAnnouncement has been sent!`
                ),
              ],
              ephemeral: true,
            }).then(() => Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false));
            channel.send({
              content: "@everyone",
              embeds: [
                embed(
                  `**Announcement** \n` + announcement
                ).setFooter(
                  `Announcement by ${
                    interaction.user.username +
                    "#" +
                    interaction.user.discriminator
                  }`
                ),
              ],
            }).then(() => Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false));
          }
        });
      });
  },
};
