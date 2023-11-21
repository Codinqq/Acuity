const {
  SlashCommandBuilder,
} = require("discord.js");
let { embed } = require("../../Utils/Embeds");
let { getGuild } = require("../../Utils/Database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Check the current queue")
    .setDMPermission(false),
  execute: async (Acuity, interaction) => {
    let guild = await getGuild(interaction.guild.id);

    const player = Acuity.manager.players.get(interaction.guild.id);
    if (!player)
      return interaction.reply({
        embeds: [
          embed(`**Music**        
        This is the queue command, so you can see which songs are playing.
        
        Sadly there's no music playing in this guild.
        
        To play some music, use - \`/play <search-term / link>\``),
        ],
        ephemeral: true,
      });

    let index = 1;
    let queueList = "";

    if (player.queue.current)
      queueList += `**Playing**
      Title - **[${player.queue.current.title}](${player.queue.current.uri})**
      Author  - **${player.queue.current.author}**
      Requester - **${player.queue.current.requester.username}#${player.queue.current.requester.discriminator}**\n\n`;

    if (player.queue[0])
      queueList += `**Queue**\n${player.queue
        .slice(0, 9)
        .map(
          (x) =>
            `**${index++}.** **${x.author}** - **[${x.title}](${x.uri})**\nRequested by **${x.requester.username
            }#${x.requester.discriminator}**`
        )
        .join("\n")}`;

    return interaction.reply({
      embeds: [
        embed(`${queueList}`),
      ],
    });
  },
};
