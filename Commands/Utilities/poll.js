const {
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");
let { embed, noPerms } = require("../../Utils/Embeds");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Make a poll so people may vote on certain things")
    .addStringOption((option) =>
      option
        .setName("poll")
        .setDescription(
          "Send out the specified message to make guild members vote on it."
        )
        .setRequired(true)
    )
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
      return interaction
        .reply({ embeds: [noPerms("MANAGE_MESSAGES")] })
        .then((m) =>
          interaction.fetchReply().then((m) => {
            setTimeout(() => {
              m.delete();
            }, 3000);
          })
        );

    let poll = interaction.options.getString("poll");

    if (interaction.options.getBoolean("currentchannel") === true) {
      let pollEmbed = embed(`**Poll**\n${poll}`).setFooter({
        text:
          `Poll by ${interaction.user.username + "#" + interaction.user.discriminator
          }`
      }
      );

      interaction.reply({ embeds: [pollEmbed] }).then(async (m) => {
        await interaction.fetchReply().then(m => m.react("✅"))
        await interaction.fetchReply().then(m => m.react("❌"))
      });
    } else {
      let pollEmbed = embed(`**Poll**\n${poll}`).setFooter({
        text: `Poll by ${interaction.user.username + "#" + interaction.user.discriminator
          }`
      }
      );

      let pollChannel = interaction.guild.channels.cache.find(
        (m) => m.name === "polls" || m.name === "poll"
      );

      if (pollChannel) {
        if (
          !interaction.guild.members.me
            .permissionsIn(pollChannel)
            .has(PermissionFlagsBits.SendMessages)
        ) {
          return interaction.reply({
            embeds: [
              embed(`**Polls**            
            I do not have permission to write in the #poll(s) channel!
            
            Please let me write in the #poll(s) channel before trying again.`),
            ],
          });
        }

        if (
          !interaction.guild.members.me
            .permissionsIn(pollChannel)
            .has(PermissionFlagsBits.AddReactions)
        ) {
          return interaction.reply({
            embeds: [
              embed(`**Polls**            
            I do not have permission to add reactions in the #poll(s) channel!
            
            Please let me add reactions in the #poll(s) channel before trying again.`),
            ],
          });
        }

        interaction
          .reply({
            embeds: [embed(`**Poll**\nPoll has been sent!`)],
          })
          .then((m) =>
            interaction.fetchReply().then((m) => {
              setTimeout(() => {
                m.delete();
              }, 3000);
            })
          );

        pollChannel.send({ embeds: [pollEmbed] }).then(async (m) => {
          m.react("✅");
          m.react("❌");
        });
      } else {
        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.AddReactions)) {
          return interaction.reply({
            embeds: [
              embed(`**Polls**            
            I do not have permission to add reactions in this channel!
            
            Please let me add reactions in this channel before trying again.`),
            ],
          });
        }

        interaction.reply({ embeds: [pollEmbed] }).then(async (m) => { });
      }
    }
  },
};
