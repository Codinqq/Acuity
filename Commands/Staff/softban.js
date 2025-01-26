const {
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");
let { getGuild } = require("../../Utils/Database");
let { embed, noPerms, logs, user } = require("../../Utils/Embeds");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("softban")
    .setDescription("Softban a user!")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Specify the user of the user you want to softban")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Specify the reason of the softban")
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
          embed(`**Softban**
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

    if (userMember.permissions.has(PermissionFlagsBits.BanMembers))
      return interaction.reply({
        embeds: [
          embed(`**Softban**                                
        You can't softban a user with the \`Ban Members\` permission.`),
        ],
        ephemeral: true,
      });
    if (userMember.id === interaction.user.id)
      return interaction.reply({
        embeds: [
          embed(`**Softban**                                
        You can't softban yourself.`),
        ],
        ephemeral: true,
      });

    let logChannel = interaction.guild.channels.cache.find(
      (c) => c.id === guild.settings.channels.botLogs
    );

    let invite = await interaction.channel
      .createInvite({
        reason: "Softban - " + userMember.user.tag,
        maxUses: 1,
      })
      .then(async (i) => {
        if (!i.code) {
          return interaction.reply({
            embeds: [
              embed(`**Softban** 
                    Couldn't create an invite for the softbanned user.`),
            ],
            ephemeral: true,
          });
        }

        await userMember
          .send({
            embeds: [
              user(
                "Softban",
                interaction.user,
                interaction.guild,
                reason + `\n**Invite - **${i.url}`
              ),
            ],
          })
          .catch((err) => {
            if (err)
              interaction.channel.send({
                embeds: [
                  embed(`**Softban** 
                I couldn't send a message to this user, as they don't have direct-messages enabled.`),
                ],
              });
          });
        interaction.guild.members.ban(userMember, {
          reason: "Acuity - " + reason,
          days: 1,
        });
      });

    if (logChannel)
      await logChannel.send({
        embeds: [
          logs(
            "Softban",
            userMember.user,
            interaction.user,
            interaction.channel,
            reason
          ),
        ],
      });

    setTimeout(() => {
      interaction.guild.members.unban(userMember, "Acuity - Softban");
    }, 1000);

    return interaction
      .reply({
        embeds: [
          embed(`**Softban**                                
                    ${
                      userMember.user.username +
                      "#" +
                      userMember.user.discriminator
                    } has been softbanned by ${
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
