const {
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");
let { embed } = require("../../Utils/Embeds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play music in the guild")
    .addStringOption((option) =>
      option
        .setName("searchterm")
        .setDescription("Search for a new song to play")
        .setRequired(true)
    )
    .setDMPermission(false),
  execute: async (Acuity, interaction) => {

    let { channel } = interaction.member.voice;
    
    await interaction.deferReply();

    if (!channel) {
      return interaction.editReply({
        embeds: [
          embed(`**Music**            
            You aren't in a voice channel.
            
            Please join a voice-channel before executing the command again.`),
        ],
        ephemeral: true,
      });
    }

    if (!interaction.guild.members.me.permissionsIn(channel).has(PermissionFlagsBits.Connect) | !interaction.guild.members.me.permissionsIn(channel).has(PermissionFlagsBits.Speak)) {
      return interaction.editReply({
        embeds: [
          embed(`**Music**            
            I do not have permission to join/speak in the voicechannel you're connected to.
            
            Please let me speak/connect to the voice channel before trying again.`),
        ],
        ephemeral: true,
      });
    }

    const player = await Acuity.manager.create({
      guild: interaction.guild.id,
      voiceChannel: interaction.member.voice.channelId,
      textChannel: interaction.channel.id,
    });

    if (player.state !== "CONNECTED") player.connect();

    let search = interaction.options.getString("searchterm");

    let res;

    try {
      res = await player.search({
        query: search,
        source: "soundcloud"
      }, interaction.user);
      if (res.loadType === "LOAD_FAILED") {
        if (!player.queue.current) player.destroy();
        throw res.exception;
      }
    } catch (err) {
      console.log(err)
      return interaction.editReply({
        embeds: [
          embed(`**Music**            
                There was an error while searching for music
                **${err.message}**
                
                If this is occuring frequently, please contact the Bot-Developer.`),
        ],
        ephemeral: true,
      });
    }

    switch (res.loadType) {
      case "NO_MATCHES":
        return interaction.editReply({
          embeds: [
            embed(`**Music**            
                I couldn't find any music with the search-term / link of **${search}**         

                To continue - \`/play <search-term / link>\``),
          ],
          ephemeral: true,
        });

      case "TRACK_LOADED":
        player.queue.add(res.tracks[0]);

        if (!player.playing && !player.paused && !player.queue.size) {
          player.play();
        } else {
          return interaction
            .editReply({
              embeds: [
                embed(`**Music**
                    [${res.tracks[0].title}](${res.tracks[0].uri}) from ${res.tracks[0].author} has been added to the queue.`),
              ],
            })
            .then((m) =>
              interaction.fetchReply().then((m) => {
                setTimeout(() => {
                  m.delete();
                }, 5000);
              })
            );
        }
      case "PLAYLIST_LOADED":
        player.queue.add(res.tracks);

        if (
          !player.playing &&
          !player.paused &&
          player.queue.size === res.tracks.length
        ) {
          player.play();
        } else {
          return interaction
            .editReply({
              embeds: [
                embed(`**Music**
                    The playlist **${res.playlist.name}** has been added to the queue.`),
              ],
            })
            .then((m) =>
              interaction.fetchReply().then((m) => {
                setTimeout(() => {
                  m.delete();
                }, 5000);
              })
            );
        }
      case "SEARCH_RESULT":
        let max = 5,
          collected,
          filter = (m) =>
            m.author.id === interaction.user.id &&
            /^(\d+|end)$/i.test(m.content);
        if (res.tracks.length < max) max = res.tracks.length;

        const results = res.tracks
          .slice(0, max)
          .map((track, index) => `${++index} - **${track.author}** - **${track.title}**`)
          .join("\n");

        interaction.editReply({
          embeds: [
            embed(`**Music**
                ${results}`),
          ],
          ephemeral: true,
        });

        collected = await interaction.channel.awaitMessages({
          filter,
          max: 1,
          time: 30000,
          errors: ["time"],
        });
        const first = collected.first().content;

        collected.first().delete();

        if (first.toLowerCase() === "end") {
          if (!player.queue.current) player.destroy();
          return interaction.update({
            embeds: [
              embed(`**Music**  
                  Successfully cancelled the search.`),
            ],
            ephemeral: true,
          });
        }

        const index = Number(first) - 1;
        if (index < 0 || index > max - 1)
          return interaction.update({
            embeds: [
              embed(`**Music**            
                You provided a number that was too high!
                
                Please have the number be between 1-5.

                To continue > \`/play <search-term / link>\``),
            ],
            ephemeral: true,
          });

        const track = res.tracks[index];
        player.queue.add(track);

        if (!player.playing && !player.paused && !player.queue.size)
          player.play();

        return interaction.editReply({
          embeds: [
            embed(
              `Successfully added [${track.title}](${track.uri}) to the queue`
            ),
          ],
        });
    }
  },
};
