const {
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");
let { embed, noPerms } = require("../../Utils/Embeds");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("addrole")
    .setDescription("Add a role to a user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Specify the user you want to add the role to")
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("The role Acuity will add to the specified user.")
        .setRequired(true)
    )
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  execute: async (Acuity, interaction) => {

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles))
      return interaction
        .reply({ embeds: [noPerms("Manage Roles")] })
        .then((m) =>
          interaction.fetchReply().then((m) => {
            setTimeout(() => {
              m.delete();
            }, 3000);
          })
        );

    let newRole = interaction.options.getRole("role");
    let userMember = interaction.options.getMember("user");

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({
        embeds: [
          embed(`**Add Role**
      I do not have access to manage roles.
      
      Please let me be able to manage roles before trying again`),
        ],
        ephemeral: true,
      });
    }

    userMember.roles.add(newRole, {
      reason: `Acuity > Added by ${
        interaction.user.username + "#" + interaction.user.discriminator
      }`,
    });

    return interaction
      .reply({
        embeds: [
          embed(`**Role added**
        You successfully gave ${newRole} to **${userMember.user.username}#${userMember.user.discriminator}**`),
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
