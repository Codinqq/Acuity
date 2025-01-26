let { noPerms } = require("../../Utils/Embeds");
const figlet = require("figlet");
const {
  SlashCommandBuilder, PermissionFlagsBits,
} = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("ascii")
    .setDescription("Translate text to Ascii")
    .addStringOption((option) =>
      option
        .setName("text")
        .setDescription(
          "Specify your text which is going to be translated to Ascii"
        )
        .setRequired(true)
    )
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  execute: async (Acuity, interaction) => {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages))
      return interaction
        .reply({ embeds: [noPerms("Manage Messages")] })
        .then((m) =>
          interaction.fetchReply().then((m) => {
            setTimeout(() => {
              m.delete();
            }, 3000);
          })
        );

    let toBeAsciied = interaction.options.getString("text");

    figlet(toBeAsciied, async (err, ascii) => {
      interaction.reply({ content: `\`\`\`${ascii}\`\`\`` });
    });
  },
};
