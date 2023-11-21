const {
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");
let { embed, noPerms } = require("../../Utils/Embeds");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("pinmessage")
    .setDescription("Pin a specified message")
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("The message to be pinned.")
        .setRequired(true)
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

    if (
      !interaction.guild.members.me
        .permissionsIn(interaction.channel)
        .has(PermissionFlagsBits.ManageMessages)
    ) {
      return interaction.reply({
        embeds: [
          embed(`**Pin**          
              I do not have permission to pin a message in this channel
              
              Please let me be able to pin messages in this channel before trying again.`),
        ],
      });
    }

    let message = interaction.options.getString("message");

    interaction.reply({ embeds: [embed(message)] }).then((m) =>
      interaction.fetchReply().then((m) => {
        m.pin();
      })
    );
  },
};
