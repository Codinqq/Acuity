let { getGuild } = require("../../Utils/Database");
let { embed, noPerms, logs, user } = require("../../Utils/Embeds");
const { mainColor } = require("../../config.json");
const ms = require("ms");
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("tempmute")
    .setDescription("Temporarily mute a user!")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Specify the user of the user you want to mute")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("duration")
        .setDescription("Specify the duration of the mute")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Specify the reason of the mute")
        .setRequired(true)
    )
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  execute: async (Acuity, interaction) => {
    let guild = await getGuild(interaction.guild.id);

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles))
      return interaction
        .reply({ embeds: [noPerms("Manage Messages")] })
        .then((m) =>
          interaction.fetchReply().then((m) => {
            setTimeout(() => {
              m.delete();
            }, 3000);
          })
        );

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({
        embeds: [
          embed(`**Temporary mute** 
          I do not have access to manage roles.
          
          Please let me be able to manage a roles before trying again`),
        ],
        ephemeral: true,
      });
    }

    let reason = interaction.options.getString("reason");
    let userMember = interaction.options.getMember("user");
    let duration = interaction.options.getString("duration");

    if (userMember.permissions.has(PermissionFlagsBits.ManageMessages))
      return interaction.reply({
        embeds: [
          embed(`**Temporary mute**                                
        You can't temporarily mute a user with the \`Manage Messages\` permission.`),
        ],
        ephemeral: true,
      });

    if (userMember.id === interaction.user.id)
      return interaction.reply({
        embeds: [
          embed(`**Temporary mute**                                
        You can't temporarily mute yourself.`),
        ],
        ephemeral: true,
      });

    let logChannel = interaction.guild.channels.cache.find(
      (c) => c.id === guild.settings.channels.botLogs
    );

    let muteRole = interaction.guild.roles.cache.find(
      (c) => c.name === "Muted"
    );

    if (!muteRole) {
      muteRole = await interaction.guild.roles.create({
        name: "Muted",
        color: mainColor,
        position: 0,
        reason: "Acuity - No muterole found.",
      });
      await interaction.guild.channels.cache.forEach(async (channel, id) => {
        await channel.permissionOverwrites.create(role, {
          SendMessages: false,
          AddReactions: false
        });
      });
    }
    await userMember
      .send({
        embeds: [
          user(
            "Mute",
            interaction.user,
            interaction.guild,
            `${reason}**\nDuration - **${duration}`
          ),
        ],
      })
      .catch(() => {
        interaction.channel.send({
          embeds: [
            embed(`**Temporary mute** 
                            I couldn't send a message to this user, as they don't have direct-messages enabled.`),
          ],
          ephemeral: true,
        });
      });
    if (logChannel)
      await logChannel.send({
        embeds: [
          logs(
            "Mute",
            userMember.user,
            interaction.user,
            interaction.channel,
            `${reason}**\nDuration - **${duration}`
          ),
        ],
      });
    await userMember.roles.add(muteRole);

    setTimeout(() => {
      logChannel.send({
        embeds: [
          logs(
            "Unmuted",
            userMember.user,
            interaction.user,
            interaction.channel,
            "The temporary mute is now over"
          ),
        ],
      });
      userMember.roles.remove(muteRole);
    }, ms(duration));
    return interaction
      .reply({
        embeds: [
          embed(`**Temporary mute**                               
                    ${
                      userMember.user.username +
                      "#" +
                      userMember.user.discriminator
                    } has been temporarily muted by ${
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
