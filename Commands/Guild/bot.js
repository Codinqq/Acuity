let { embed } = require("../../Utils/Embeds");
const moment = require("moment");
let { version } = require("../../config.json");
const {
  SlashCommandBuilder,
} = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("bot")
    .setDescription("Get information about Acuity!")
    .setDMPermission(false),
  execute: async (Acuity, interaction) => {
    await interaction.deferReply()
      .then((m) => {
        interaction.fetchReply().then((m) => {
            const duration = moment
              .duration(Acuity.uptime)
              .format(" D [days], H [hrs], m [mins], s [sec]");

            let Codinq = Acuity.users.cache.find((c) => c.id === "740213771179524187");

            return interaction.editReply({
              embeds: [
                embed(`**About**
                **Acuity** was created to be an replacement for most of the popular bots on Discord, with having the paid features from other popular bots available for everyone.
                **Acuity** is still under active development, with updates releasing every few months, adding more features, and bugs getting fixed as soon as possible. 
                My one and only creator is **${Codinq.username + "#" + Codinq.discriminator}** [\`${Codinq.id}\`].
                
                I am currently on version **v${version}**! - Join the Support Server to check what was added in the newest version!
                    
                Join my Support Server! - [Click here](https://acuity.codinq.xyz/discord)
                Check out my website! - [Click here](https://acuity.codinq.xyz/)

                I've been up for **${duration}**.

                My latency is **${Math.floor(
                    m.createdTimestamp - interaction.createdTimestamp
                  )}ms**
                The API latency is **${Math.round(Acuity.ws.ping)}ms**

                I am currently serving **${Acuity.guilds.cache.size}** guilds and **${Acuity.users.cache.size}** users.`),
              ],
            });
        });
      });
  },
};
