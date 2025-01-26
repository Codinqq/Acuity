const {
  SlashCommandBuilder,
} = require("discord.js");
let { embed } = require("../../Utils/Embeds");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Change the volume of the music")
    .addNumberOption((option) =>
      option
        .setName("value")
        .setDescription("The volume you want it to be set to.")
        .setRequired(true)
    )
    .setDMPermission(false),
  execute: async (Acuity, interaction) => {
    const player = Acuity.manager.players.get(interaction.guild.id);

    if (!player)
      return interaction.reply({
        embeds: [
          embed(`**Music**        
        This is the volume command, so you can change the volume on the bot.
        
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

    let volume = interaction.options._hoistedOptions.find(
      (c) => c.name === "value"
    ).value;

    if (volume <= 0 || volume > 100 || !volume) {
      return interaction.reply({
        embeds: [
          embed(`**Music**
            The volume has to be between 0 and 100.`),
        ],
        ephemeral: true,
      });
    }

    player.setVolume(volume);

    return interaction
      .reply({
        embeds: [
          embed(`**Music**
        The volume has been set to **${volume}**`),
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
