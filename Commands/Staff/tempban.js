let { getGuild } = require("../../Utils/Database");
let { embed, noPerms, logs, user } = require("../../Utils/Embeds");
const ms = require("ms");
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tempban")
    .setDescription("Temporarily ban a user!")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Specify the user of the user you want to ban")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("duration")
        .setDescription("Specify the duration of the ban")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Specify the reason of the ban")
        .setRequired(true)
    )
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  execute: async (Acuity, interaction) => {
    let guild = await getGuild(interaction.guild.id);
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers))
      return interaction.reply({ embeds: [noPerms("Ban Members")] }).then((m) =>
        interaction.fetchReply().then((m) => {
          setTimeout(() => {
            m.delete();
          }, 3000);
        })
      );

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({
        embeds: [
          embed(`**Temporary ban**
        I do not have access to manage a users ban.
        
        Please let me be able to manage a users ban before trying again`),
        ],
        ephemeral: true,
      });
    }

    let reason = interaction.options._hoistedOptions.find(
      (c) => c.name === "reason"
    ).value;

    let userMember = interaction.options.getMember("user");

    let duration = interaction.options._hoistedOptions.find(
      (c) => c.name === "duration"
    ).value;

    if (userMember.permissions.has(PermissionFlagsBits.BanMembers))
      return interaction.reply({
        embeds: [
          embed(`**Temporary ban**                                
        You can't temporarily ban a user with the \`Ban Members\` permission.`),
        ],
        ephemeral: true,
      });

    if (userMember.id === interaction.user.id)
      return interaction.reply({
        embeds: [
          embed(`**Temporary ban**                                
        You can't temporarily ban yourself.`),
        ],
        ephemeral: true,
      });

    let logChannel = interaction.guild.channels.cache.find(
      (c) => c.id === guild.settings.channels.botLogs
    );

    await userMember
      .send({
        embeds: [
          user(
            "Temporary ban",
            interaction.user,
            interaction.guild,
            `${reason}**\nDuration - **${duration}`
          ),
        ],
      })
      .catch(() => {
        interaction.channel.send({
          embeds: [
            embed(`**Temporary ban** 
                        I couldn't send a message to this user, as they don't have direct-messages enabled.`),
          ],
          ephemeral: true,
        });
      });

    if (logChannel)
      await logChannel.send({
        embeds: [
          logs(
            "Temporary ban",
            userMember.user,
            interaction.user,
            interaction.channel,
            `${reason}**\nDuration - **${duration}`
          ),
        ],
      });
    await interaction.guild.members.ban(userMember, {
      reason: `Acuity - ${reason}`,
      days: 7,
    });

    setTimeout(() => {
      logChannel.send({
        embeds: [
          logs(
            "Unbanned",
            userMember.user,
            interaction.user,
            interaction.channel,
            "Temporary ban has expired"
          ),
        ],
      });
      interaction.guild.members.unban(userMember.id);
    }, ms(duration));

    return interaction
      .reply({
        embeds: [
          embed(`**Temporary ban**                                
                    ${
                      userMember.user.username +
                      "#" +
                      userMember.user.discriminator
                    } has been temporarily banned by ${
            interaction.user.username + "#" + interaction.user.discriminator
          }`),
        ],
      })
      .then((m) =>
        interaction.fetchReply().then((m) => {
          setTimeout(() => {
            m.delete();
          }, 3000);
        })
      );
  },
};
