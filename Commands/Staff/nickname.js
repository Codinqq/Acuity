const {
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");
let { embed, noPerms } = require("../../Utils/Embeds");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("nick")
    .setDescription("Nick yourself or others!")
    .addStringOption((option) =>
      option
        .setName("newnick")
        .setDescription("Change your/other persons nicknames")
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Specify the user you want to change the nickname of")
        .setRequired(false)
    )
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ChangeNickname),
  execute: async (Acuity, interaction) => {

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageNicknames)) {
      return interaction
        .reply({
          embeds: [
            embed(`**Nickname**
            I do not have access to manage a users nickname.
            
            Please let me be able to manage a users nickname before trying again`),
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

    let newNick = interaction.options.getString("newnick");
    let userMember = interaction.options.getUser("user");

    if (!userMember || userMember.id === interaction.user.id) {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ChangeNickname))
        return interaction
          .reply({ embeds: [noPerms("Change Nickname")] })
          .then((m) =>
            interaction.fetchReply().then((m) => {
              setTimeout(() => {
                m.delete();
              }, 3000);
            })
          );

      if (
        interaction.member.roles.highest.position >
          interaction.guild.members.me.roles.highest.position ||
        interaction.user.id === interaction.guild.ownerId
      )
        return interaction
          .reply({
            embeds: [
              embed(`**Nickname**
                I can't change your nickname because your highest role is above my highest role!`),
            ],
          })
          .then((m) =>
            interaction.fetchReply().then((m) => {
              setTimeout(() => {
                m.delete();
              }, 3000);
            })
          );

      interaction.member.setNickname(newNick);

      return interaction
        .reply({
          embeds: [
            embed(`**Nickname Changed**
                    You successfully set your nickname to **${newNick}**`),
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
      userMember = await interaction.guild.members.fetch(userMember.id);

      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageNicknames))
        return interaction
          .reply({ embeds: [noPerms("Manage Nicknames")] })
          .then((m) =>
            interaction.fetchReply().then((m) => {
              setTimeout(() => {
                m.delete();
              }, 3000);
            })
          );

      if (
        userMember.permissions.has(PermissionFlagsBits.ManageNicknames) &&
        interaction.user.id !== interaction.guild.ownerId
      )
        return interaction
          .reply({
            embeds: [
              embed(`**Nickname**
                You may not change the nickname of this user`),
            ],
          })
          .then((m) =>
            interaction.fetchReply().then((m) => {
              setTimeout(() => {
                m.delete();
              }, 3000);
            })
          );

      if (
        userMember.roles.highest.position >
          interaction.guild.members.me.roles.highest.position &&
        interaction.user.id === interaction.guild.ownerId
      )
        return interaction
          .reply({
            embeds: [
              embed(`**Nickname**
                I can't change your nickname because your highest role is above my highest role!`),
            ],
          })
          .then((m) =>
            interaction.fetchReply().then((m) => {
              setTimeout(() => {
                m.delete();
              }, 3000);
            })
          );

      userMember.setNickname(newNick);
      return interaction
        .reply({
          embeds: [
            embed(`**Nickname Changed**
                    You successfully set ${
                      userMember.user.username +
                      "#" +
                      userMember.user.discriminator
                    }'s nickname to **${newNick}**`),
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
