const {
  SlashCommandBuilder,
} = require("discord.js");
let { embed } = require("../../Utils/Embeds");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Resume the currently paused song.")
    .setDMPermission(false),
  execute: async (Acuity, interaction) => {
    const player = Acuity.manager.players.get(interaction.guild.id);

    if (!player)
      return interaction.reply({
        embeds: [
          embed(`**Music**        
          This is the resume command, where you may resume paused songs.
          
          Sadly there's no music playing in this guild.
          
          To play some music, use - \`/play <search-term / link>\``),
        ],
        ephemeral: true,
      });

    const { channel } = interaction.member.voice;
    if (!channel) {
      return interaction.reply({
        embeds: [
          embed(`**Music**            
              You aren't in a voice channel.
              
              Please join a voice-channel before executing the command again.`),
        ],
        ephemeral: true,
      });
    }
    if (channel.id !== player.voiceChannel) {
      return interaction.reply({
        embeds: [
          embed(`**Music**            
              You aren't in the same voice-channel as Acuity
              
              Please join the right voice-channel before executing the command again.`),
        ],
        ephemeral: true,
      });
    }

    if (!player.paused) return interaction.reply({
      embeds: [
        embed(`**Music**            
            The music is currently playing.`),
      ],
      ephemeral: true,
    });

    player.pause(false);

    return interaction
      .reply({
        embeds: [
          embed(`**Music**
          ${player.queue.current.title} has been resumed.`),
        ],
      })
      .then((msg) => {
        interaction.fetchReply().then((msg) => {
          setTimeout(() => {
            msg.delete();
          }, 3000);
        });
      });
  },
};
