const {
  SlashCommandBuilder,
} = require("discord.js");
let { embed } = require("../../Utils/Embeds");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop the currently playing queue.")
    .setDMPermission(false),
  execute: async (Acuity, interaction) => {
    const player = Acuity.manager.players.get(interaction.guild.id);

    if (!player)
      return interaction.reply({
        embeds: [
          embed(`**Music**        
          This is the stop command, where you may stop Acuity from playing more music.
          
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

    if (!player) return interaction.reply({
      embeds: [
        embed(`**Music**            
            The music is currently stopped.`),
      ],
      ephemeral: true,
    });

    player.destroy();

    return interaction
      .reply({
        embeds: [
          embed(`**Music**
          The music has been stopped.`),
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
