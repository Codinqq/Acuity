const {
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");
let { embed, noPerms } = require("../../Utils/Embeds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("echo")
    .setDescription("Make Acuity say a message")
    .addBooleanOption((option) =>
      option
        .setName("messageembed")
        .setDescription("Make this an embed")
        .setRequired(false)
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

    const msgFilter = (m) => m.author.id === interaction.member.user.id;

    interaction
      .reply({
        embeds: [
          embed(`**Echo**
      What do you want Acuity to repeat?`),
        ],
      })
      .then((msg) => {
        Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,true)
        var msgCollector = interaction.channel.createMessageCollector({
          msgFilter,
          max: 1,
        });
        msgCollector.on("collect", async (collected) => {
          let message = collected.content;

          collected.delete();

          interaction.fetchReply().then((msg) => {
            setTimeout(() => {
              msg.delete();
            }, 3000);
          });

          if (interaction.options.getBoolean("messageembed") === true) {
            return interaction.channel.send({ embeds: [embed(message)] }).then(() => Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false));
          } else {
            return interaction.channel.send({ content: message, embeds: [] }).then(() => Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false));
          }
        });
      });
  },
};
