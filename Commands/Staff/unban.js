const {
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");
let { getGuild } = require("../../Utils/Database");
let { embed, noPerms, logs } = require("../../Utils/Embeds");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Unban a user!")
    .addStringOption((option) =>
      option
        .setName("userid")
        .setDescription("Specify the userid of the user you want to unban")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Specify the reason of the unban")
        .setRequired(true)
    )
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  execute: async (Acuity, interaction) => {
    let guild = await getGuild(interaction.guild.id);

    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers))
      return interaction.reply({
        embeds: [noPerms("Ban Members")],
        ephemeral: true,
      });

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({
        embeds: [
          embed(` **Unban**
      I do not have access to unban a user.
      
      Please let me be able to manage a users ban before trying again`),
        ],
        ephemeral: true,
      });
    }

    let reason = interaction.options.getString("reason");

    let userMember = interaction.options.getString("userid");

    if (userMember === interaction.user.id)
      return interaction.reply({
        embeds: [
          embed(`**Unban**                                
        You can't unban yourself.`),
        ],
        ephemeral: true,
      });
    let logChannel = interaction.guild.channels.cache.find(
      (c) => c.id === guild.settings.channels.botLogs
    );

    interaction.reply({
      embeds: [
        embed(`**Unban**                                
                    The user with the id \`${userMember}\` has been unbanned!`),
      ],
      ephemeral: true,
    });

    if (logChannel)
      await logChannel.send({
        embeds: [
          logs(
            "Unban",
            userMember,
            interaction.user,
            interaction.channel,
            reason
          ),
        ],
      });
    await interaction.guild.bans.remove(userMember, "Acuity - " + reason);
  },
};
