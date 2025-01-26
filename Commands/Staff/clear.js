const {
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");
let { getGuild } = require("../../Utils/Database");
let { embed, noPerms } = require("../../Utils/Embeds");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Clear an amount of messages from the chat.")
    .addNumberOption((option) =>
      option
        .setName("amount")
        .setDescription("Clear the specified amount of messages from the chat")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Specify the reason of the removal")
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("clearuser")
        .setDescription("Clear x messages from a user")
        .setRequired(false)
    )
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  execute: async (Acuity, interaction) => {
    let guild = await getGuild(interaction.guild.id);

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages))
      return interaction
        .reply({ embeds: [noPerms("Manage Messages")] })
        .then((m) =>
          interaction.fetchReply().then((m) => {
            setTimeout(() => {
              m.delete();
            }, 3000);
          })
        );

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({
        embeds: [
          embed(`**Clear**
            I do not have access to manage messages.
            
            Please let me be able to manage messages before trying again`),
        ],
        ephemeral: true,
      });
    }

    let messages = interaction.options.getNumber("amount");
    let userMember = interaction.options.getMember("user");
    let reason = interaction.options.getString("reason");

    if (messages < 2) {
      return interaction.reply({
        embeds: [
          embed(`**Clear**                                
                    You have to specify a number higher than 2.

                    To use this command correctly - \`/clear [user] <number> <reason>\``),
        ],
        ephemeral: true,
      });
    }
    let logChannel = interaction.guild.channels.cache.find(
      (c) => c.id === guild.settings.channels.botLogs
    );

    if (userMember) {
      interaction.channel.messages.fetch().then(async (msgs) => {
        await interaction.channel.bulkDelete(msgs, true);

        if (!messages.length === 0) {
          return interaction.reply({
            embeds: [
              embed(`**Clear**                                
                                I couldn't get any messages from ${userMember}!

                                To use this command correctly - \`/clear [user] <number> <reason>\``),
            ],
            ephemeral: true,
          });
        }

        if (logChannel) {
          await logChannel.send({
            embeds: [
              embed(`**Clear-Chat**
                            Moderator - **${interaction.user.username}#${
                interaction.user.discriminator
              }**
                            Channel - ${interaction.channel}
                        
                            Messages Deleted - **${String(messages)}**
                            Messages From - **${userMember.user.username}#${
                userMember.user.discriminator
              }**
                            Reason - **${reason}**`),
            ],
          });
        }
        return await interaction.reply({
          embeds: [
            embed(`**Messages Cleared**
                            You successfully removed ${String(
                              messages
                            )} messages from ${userMember}.`),
          ],
          ephemeral: true,
        });
      });
    } else {
      if (logChannel) {
        interaction.channel.bulkDelete(messages);

        logChannel.send({
          embeds: [
            embed(`**Clear-Chat**
                        Moderator - **${interaction.user.tag}**
                        Channel - ${interaction.channel}
                    
                        Messages Deleted - **${String(messages)}**
                        Reason - **${reason}**`),
          ],
        });
      }
      interaction.channel.bulkDelete(messages);

      return interaction.reply({
        embeds: [
          embed(`**Messages Cleared**
                        You successfully removed ${String(
                          messages
                        )} messages.`),
        ],
        ephemeral: true,
      });
    }
  },
};
