const {
  SlashCommandBuilder,
} = require("discord.js");
let { getUser } = require("../../Utils/Database");
let { embed } = require("../../Utils/Embeds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("afk")
    .setDescription("Set yourself as afk!")
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Specify your reason to be afk")
        .setRequired(true)
    )
    .setDMPermission(false),
  execute: async (Acuity, interaction) => {
    let user = await getUser(interaction.user.id);

    let reason = interaction.options.getString("reason");

    if (!reason) reason = "User didn't define a reason.";

    user.settings.afk.enabled = true;
    user.settings.afk.message = reason;

    user.save().catch((err) => console.log(err));

    interaction.reply({
      embeds: [
        embed(`**AFK**
            ${
              interaction.user.username + "#" + interaction.user.discriminator
            } is now **afk**.
            
            **Reason**
            ${reason}`),
      ],
    });
  },
};
