const {
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");
let { getGuild } = require("../../Utils/Database");
let { embed, noPerms, logs, user } = require("../../Utils/Embeds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a user!")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Specify the user of the user you want to kick")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Specify the reason of the kick")
        .setRequired(true)
    )
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  execute: async (Acuity, interaction) => {
    let guild = await getGuild(interaction.guild.id);

    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers))
      return interaction
        .reply({ embeds: [noPerms("Kick Messages")] })
        .then((m) =>
          interaction.fetchReply().then((m) => {
            setTimeout(() => {
              m.delete();
            }, 3000);
          })
        );

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction
        .reply({
          embeds: [
            embed(`**KICK**
        I do not have access to kick a user.
        
        Please let me be able to kick a user before trying again`),
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

    let reason = interaction.options._hoistedOptions.find(
      (c) => c.name === "reason"
    ).value;

    let userMember = interaction.options.getMember("user");

    if (userMember.permissions.has(PermissionFlagsBits.KickMembers))
      return interaction
        .reply({
          embeds: [
            embed(`**Kick**                                
        You can't kick a user with the \`Kick Members\` permission.`),
          ],
        })
        .then((m) =>
          interaction.fetchReply().then((m) => {
            setTimeout(() => {
              m.delete();
            }, 3000);
          })
        );

    if (userMember.id === interaction.user.id)
      return interaction
        .reply({
          embeds: [
            embed(`**Kick**
        You can't kick yourself.`),
          ],
        })
        .then((m) =>
          interaction.fetchReply().then((m) => {
            setTimeout(() => {
              m.delete();
            }, 3000);
          })
        );

    let logChannel = interaction.guild.channels.cache.find(
      (c) => c.id === guild.settings.channels.botLogs
    );

    await userMember
      .send({
        embeds: [user("Kick", interaction.user, interaction.guild, reason)],
      })
      .catch(() => {
        interaction.channel
          .send(
            embed(`**Kick** 
                I couldn't send a message to this user, as they don't have direct-messages enabled.`)
          )
          .then((m) =>
            setTimeout(() => {
              m.delete();
            }, 3000)
          );
      });

    await logChannel.send({
      embeds: [
        logs(
          "Kick",
          userMember.user,
          interaction.user,
          interaction.channel,
          reason
        ),
      ],
    });

    await userMember.kick("Acuity - " + reason);

    return interaction
      .reply({
        embeds: [
          embed(`**Kick**                                
                ${
                  userMember.user.username + "#" + userMember.user.discriminator
                } has been kicked by ${
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
