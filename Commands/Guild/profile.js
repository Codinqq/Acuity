let { getGuild, getUser, getGuildUser } = require("../../Utils/Database");
let { embed } = require("../../Utils/Embeds");
const moment = require("moment");
const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  InteractionType,
  InteractionCollector,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Find out what your or a friends profile is.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to fetch the profile from")
        .setRequired(false)
    )
    .addBooleanOption((option) =>
      option
        .setName("settings")
        .setDescription("Choose if you want to go into the settings.")
        .setRequired(false)
    )
    .setDMPermission(false),
  execute: async (Acuity, interaction) => {
    let guild = await getGuild(interaction.guild.id);

    let verifiedPartner = "✅ Partner";
    let botDev = "🔧 Bot Owner";
    let botMod = "🛡️ Bot Administrator";
    let enabled = "✅ Enabled";

    let userMember = interaction.options.getMember("user");

    let user = await getUser(
      userMember ? userMember.user.id : interaction.user.id
    );
    let gUser = await getGuildUser(
      userMember ? userMember.user.id : interaction.user.id,
      interaction.guild.id
    );
    var badges = "";

    if (interaction.options.getBoolean("settings")) {
      const settingsModal = new ModalBuilder()
        .setCustomId("settingsModal")
        .setTitle("Settings");

      const descModal = new TextInputBuilder()
        .setCustomId("descSetting")
        .setLabel("Description")
        .setValue(user.settings.about.bio)
        .setStyle(TextInputStyle.Paragraph)
        .setMaxLength(200);

      const countryModal = new TextInputBuilder()
        .setCustomId("countrySetting")
        .setLabel("Country")
        .setValue(user.settings.about.country)
        .setStyle(TextInputStyle.Short)
        .setMaxLength(60);

      const steamIDModal = new TextInputBuilder()
        .setCustomId("steamIDSetting")
        .setLabel("Steam ID")
        .setValue((!user.settings.games.steamID ? "" : user.settings.games.steamID))
        .setStyle(TextInputStyle.Short)
        .setMaxLength(17);

      const descActionRow = new ActionRowBuilder().addComponents(descModal);
      const countryActionRow = new ActionRowBuilder().addComponents(countryModal);
      const steamActionRow = new ActionRowBuilder().addComponents(steamIDModal);

      settingsModal.addComponents(descActionRow, countryActionRow, steamActionRow);

      await interaction.showModal(settingsModal).then(async (modal) => {
        const modal_collector = new InteractionCollector(Acuity, {
          interactionType: InteractionType.ModalSubmit,
          max: 1,
        });

        modal_collector.on("collect", async (modal_col) => {
          let bio = modal_col.fields.getTextInputValue("descSetting");
          let country = modal_col.fields.getTextInputValue("countrySetting");
          let steamID = modal_col.fields.getTextInputValue("steamIDSetting");

          let changes = "";

          if (user.settings.about.bio != bio)
            changes += `Description - **${bio}**\n`;
          if (user.settings.about.country != country)
            changes += `Country - **${country}**\n`;
          if (user.settings.games.steamID != steamID)
            changes += `Steam-ID - **${steamID}**\n`;

          user.settings.about.bio = bio;
          user.settings.about.country = country;
          user.settings.games.steamID = steamID;

          user.save().catch((err) => console.log(err));

          modal_col
            .reply({
              embeds: [
                embed(`**Settings**
            You've changed your settings!
            __**Changes**__
            ${changes != "" ? changes : "None"}`),
              ],
            })
            .then(async (msg) => {
              setTimeout(() => {
                modal_col.deleteReply();
              }, 5000);
            });
        });
      });
    } else {
      if (user.settings.badges.botDev === true) {
        badges += botDev + "\n";
      } else if (user.settings.badges.botMod === true) {
        badges += botMod + "\n";
      }

      if (user.settings.badges.verifiedPartner === true)
        badges += verifiedPartner + "\n";

      if (
        interaction.member.permissions.has(PermissionFlagsBits.Administrator)
      ) {
        badges += `🛠️ Administrator\n`;
      } else if (
        interaction.member.permissions.has(PermissionFlagsBits.KickMembers)
      ) {
        badges += `⚔️ Moderator\n`;
      }

      if (badges === "") badges = "`No badges found.`";

      let levels = "";

      if (guild.addons.levels.enabled === true) {
        levels = `\n**Level**\nLevel - **${gUser.settings.level.level}**\nExp - **${gUser.settings.level.xp}**\n`;
      }

      return interaction.reply({
        embeds: [
          embed(`**Profile**
            Name - **${
              userMember ? userMember.user.tag : interaction.user.tag
            }**
            Id - **${userMember ? userMember.user.id : interaction.user.id}**
            Created - **${moment(
              userMember
                ? userMember.user.createdAt
                : interaction.user.createdAt
            )
              .utc()
              .format("MMM Do YYYY, HH:mm")} UTC**

            **About**
            Description - **${user.settings.about.bio}**
            Country - **${user.settings.about.country}**

            **Server Profile**
            Joined - **${moment(
              userMember ? userMember.joinedAt : interaction.member.joinedAt
            )
              .utc()
              .format("MMM Do YYYY, HH:mm")} UTC**
            Highest role - **${
              userMember
                ? userMember.roles.highest.name
                : interaction.member.roles.highest.name
            }**
            ${levels}
            **AFK**
            ${
              user.settings.afk.enabled
                ? `${enabled + " | **" + user.settings.afk.message + "**"}`
                : "**This user is not afk.**"
            }
            
            **Badges**
            **${badges}**`),
        ],
      });
    }
  },
};
