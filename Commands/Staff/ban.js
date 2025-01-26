const {
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");
let { getGuild } = require("../../Utils/Database");
let { embed, noPerms, logs, user } = require("../../Utils/Embeds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a user!")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Specify the user of the user you want to ban")
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
      return interaction
        .reply({
          embeds: [
            embed(`**Ban**
          I do not have access to manage a users ban.
          
          Please let me be able to manage a users ban before trying again`),
          ],
          ephemeral: true,
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

    if (userMember.permissions.has(PermissionFlagsBits.BanMembers))
      return interaction
        .reply({
          embeds: [
            embed(`**Ban**                                
        You can't ban a user with the \`Ban Members\` permission.`),
          ],
          ephemeral: true,
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
            embed(`**Ban**                                
        You can't ban yourself.`),
          ],
          ephemeral: true,
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

    if (!logChannel) {
      await userMember
        .send({
          embeds: [user("Ban", interaction.user, interaction.guild, reason)],
        })
        .catch(() => {
          interaction.channel.send({
            embeds: [
              embed(`**Ban** 
                        I couldn't send a message to this user, as they don't have direct-messages enabled.`),
            ],
            ephemeral: true,
          });
        });
      await userMember.ban({ days: 7, reason: "Acuity - " + reason });
      return interaction
        .reply({
          embeds: [
            embed(`**Ban**                                
                    ${
                      userMember.user.username +
                      "#" +
                      userMember.user.discriminator
                    } has been banned by ${
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
    } else {
      await userMember
        .send({
          embeds: [user("Ban", interaction.user, interaction.guild, reason)],
        })
        .catch(() => {
          interaction.channel.send({
            embeds: [
              embed(`**Ban** 
                        I couldn't send a message to this user, as they don't have direct-messages enabled.`),
            ],
            ephemeral: true,
          });
        });
      await logChannel.send({
        embeds: [
          logs(
            "Ban",
            userMember.user,
            interaction.user,
            interaction.guild,
            reason
          ),
        ],
      });
      await userMember.ban({ days: 7, reason: "Acuity - " + reason });

      return interaction
        .reply({
          embeds: [
            embed(`**Ban**                                
                    ${
                      userMember.user.username +
                      "#" +
                      userMember.user.discriminator
                    } has been banned by ${
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
    }
  },
};
