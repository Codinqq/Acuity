const {
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");
let { embed, noPerms } = require("../../Utils/Embeds");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("removerole")
    .setDescription("Remove a role from a user!")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Specify the user you want to remove the role from")
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("The role Acuity will remove from the specified user.")
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

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction
        .reply({
          embeds: [
            embed(`**Remove Role**
            I do not have access to manage roles.
            
            Please let me be able to manage roles before trying again`),
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

    let newRole = interaction.options.getRole("role");
    let userMember = interaction.options.getMember("user");

    if (!userMember) {
      return interaction
        .reply({
          embeds: [
            embed(`**Remove Role**                                
            I couldn't find the user you defined.

            To use this command correctly - \`/removerole <user-id/user-tag> <role>\``),
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

    if (!newRole) {
      return interaction
        .reply({
          embeds: [
            embed(`**Remove Role**                                
            I couldn't find the role that you wanted to remove from the user.
            
            To use this command correctly - \`/removerole <user-id/user-tag> <role>\``),
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

    userMember.roles.remove(newRole, {
      reason: `Acuity - Removed by ${
        interaction.user.username + "#" + interaction.user.discriminator
      }`,
    });

    return interaction
      .reply({
        embeds: [
          embed(`**Role removed**
        You successfully removed ${newRole} from **${userMember.user.username}#${userMember.user.discriminator}**`),
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
