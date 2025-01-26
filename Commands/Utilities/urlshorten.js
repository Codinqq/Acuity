const { SlashCommandBuilder } = require("discord.js");
let { embed } = require("../../Utils/Embeds");
let { shorten, custom } = require("isgd");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("urlshorten")
    .setDescription("Shorten an url")
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription("The url you want to shorten")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The name you want the shorten name to be")
        .setRequired(false)
    )
    .setDMPermission(false),
  execute: async (Acuity, interaction) => {
    let url = interaction.options.getString("url");
    let name = interaction.options.getString("name");

    await interaction.deferReply().then(async (i) => {

      if (name) {
        custom(url, name, function (res) {
          if (res.includes("Error")) {
            shorten(url, function (res) {

              if (res.includes("Error")) {
                return interaction.editReply({
                  embeds: [
                    embed(`**URL-Shorten**
                      I couldn't shorten the url.`),
                  ],
                  ephemeral: true,
                });
              }

              interaction.editReply({
                embeds: [
                  embed(`**URL-Shorten**
                    The name you wanted was taken, so I generated a new one.

                    Url - **${url}**
                    Shortened url - **${res}**`),
                ],
                ephemeral: true,
              });
            });
          } else {
            return interaction.editReply({
              embeds: [
                embed(`**URL-Shorten**
                  Url - **${url}**
                  Shortened url - **${res}**`),
              ],
              ephemeral: true,
            });
          }
        });
      } else {
        shorten(url, function (res) {
          return interaction.update({
            embeds: [
              embed(`**URL-Shorten**
                Url - **${url}**
                Shortened url - **${res}**`),
            ],
            ephemeral: true,
          });
        });
      }
    });
  },
};
