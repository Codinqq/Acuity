let { embed } = require("../../Utils/Embeds");
const moment = require("moment");
const {
  SlashCommandBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("guild")
    .setDescription("Get information about the guild!")
    .setDMPermission(false),
  execute: async (Acuity, interaction) => {
    let verificationLevel = interaction.guild.verificationLevel;

    if (verificationLevel === "NONE") verificationLevel = "None - Unrestricted";
    if (verificationLevel === "LOW")
      verificationLevel = "Low - Verified Email needed";
    if (verificationLevel === "MEDIUM")
      verificationLevel = "Medium - Registered for longer than 5 minutes";
    if (verificationLevel === "HIGH")
      verificationLevel = "High - Server-Member for longer than 10 minutes";
    if (verificationLevel === "VERY_HIGH")
      verificationLevel = "Highest - Verified Phone needed";

    let owner = interaction.guild.members.cache.find(
      (c) => c.id === interaction.guild.ownerId
    );

    let tiers = ["Not boosted", "Tier 1", "Tier 2", "Tier 3"];

    return interaction.reply({
      embeds: [
        embed(`**Guild**
        Name - **${interaction.guild.name}** [\`${interaction.guild.id}\`]
        Owner - **${owner.user.username}#${owner.user.discriminator}** [\`${
          owner.id
        }\`]
        Created - **${moment(interaction.guild.createdAt)
          .utc()
          .format("MMM D. YYYY, HH:mm")} UTC**

        **Settings**
        Verification Level - **${verificationLevel}**

        **Server Boost**
        Tier - **${tiers[interaction.guild.premiumTier]}**
        Boosters - **${interaction.guild.premiumSubscriptionCount}**

        **Stats**
        Members - **${interaction.guild.members.cache.size}** [**${
          interaction.guild.members.cache.filter((m) => !m.user.bot).size
        }** users - **${
          interaction.guild.members.cache.filter((m) => m.user.bot).size
        }** bots]`),
      ],
    });
  },
};
