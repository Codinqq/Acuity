const { embed } = require("../../Utils/Embeds");
const humanize = require("humanize-duration");
const messageCreate = require("../guild/messageCreate");
const {
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = async (Acuity, manager, player, track) => {

  var row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("stop")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("⏹️"),
    new ButtonBuilder()
      .setCustomId("pause")
      .setStyle(ButtonStyle.Primary)
      .setEmoji(player.isPaused ? "⏯️" : "⏸️"),
    new ButtonBuilder()
      .setCustomId("skip")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("⏭️"),
    new ButtonBuilder()
      .setCustomId("mute")
      .setStyle(ButtonStyle.Primary)
      .setEmoji(player.volume !== 0 ? "🔇" : "🔊"),
  );

  let textChannel = Acuity.channels.cache.get(player.textChannel);

  textChannel.send({
    embeds: [embed(`**Now Playing**
        Title - **[${track.title}](${track.uri})**
        Artist - **${track.author}**
        Duration - **${humanize(track.duration, { round: true, delimiter: " & " })}**
        
        Requested by **${track.requester.username}#${track.requester.discriminator}**`)], components: [row]
  }).then(m => {

    if (player.currentPlayingMsg !== m.id) {
      textChannel.messages.fetch(player.currentPlayingMsg).then(msg => { if (msg) { msg.delete() } });
      player.currentPlayingMsg = m.id;

    }
    const filter = i => i.customId === 'stop' || i.customId === "pause" || i.customId === "skip" || i.customId === "mute" && m.channel.id === player.textChannel;

    const collector = textChannel.createMessageComponentCollector({ filter });

    collector.on('collect', async i => {

      let components = [];

      if (i.customId === 'stop') {

        textChannel.send({
          embeds: [embed(`**Music**
                    The music was stopped by **${i.user.username + "#" + i.user.discriminator}** [\`${i.user.id}\`]`)]
        }).then(m => {
          setTimeout(() => {
            m.delete().catch(err => { });
          }, 3000)
        });
        player.destroy();
      }
      if (i.customId === 'pause') {

        player.pause(!player.paused);

        row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("stop")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("⏹️"),
          new ButtonBuilder()
            .setCustomId("pause")
            .setStyle(ButtonStyle.Primary)
            .setEmoji(player.paused ? "⏯️" : "⏸️"),
          new ButtonBuilder()
            .setCustomId("skip")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("⏭️"),
          new ButtonBuilder()
            .setCustomId("mute")
            .setStyle(ButtonStyle.Primary)
            .setEmoji(player.volume !== 0 ? "🔇" : "🔊"),
        );

        m.edit({ components: [row] });

        i.reply({
          embeds: [embed(`**Music**
                    The music was ${player.paused ? "paused" : "resumed"} by **${i.user.username + "#" + i.user.discriminator}** [\`${i.user.id}\`]`)]
        }).then(msg => {
          i.fetchReply().then(msg => {
            setTimeout(() => {
              msg.delete().catch(err => { });
            }, 3000)
          })
        });
      }
      if (i.customId === 'skip') {

        player.stop()

        row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("stop")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("⏹️"),
          new ButtonBuilder()
            .setCustomId("pause")
            .setStyle(ButtonStyle.Primary)
            .setEmoji(player.paused ? "⏯️" : "⏸️"),
          new ButtonBuilder()
            .setCustomId("skip")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("⏭️"),
          new ButtonBuilder()
            .setCustomId("mute")
            .setStyle(ButtonStyle.Primary)
            .setEmoji(player.volume !== 0 ? "🔇" : "🔊"),
        );

        m.edit({ components: [row] });
        textChannel.send({
          embeds: [embed(`**Music**
                    The current song was skipped by **${i.user.username + "#" + i.user.discriminator}** [\`${i.user.id}\`]`)]
        }).then(msg => {
          setTimeout(() => {
            msg.delete().catch(err => { });
          }, 3000)
        });
      }
      if (i.customId === 'mute') {

        player.setVolume(player.volume > 0 ? 0 : 100);

        row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("stop")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("⏹️"),
          new ButtonBuilder()
            .setCustomId("pause")
            .setStyle(ButtonStyle.Primary)
            .setEmoji(player.paused ? "⏯️" : "⏸️"),
          new ButtonBuilder()
            .setCustomId("skip")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("⏭️"),
          new ButtonBuilder()
            .setCustomId("mute")
            .setStyle(ButtonStyle.Primary)
            .setEmoji(player.volume !== 0 ? "🔇" : "🔊"),
        );

        m.edit({ components: [row] });

        i.reply({
          embeds: [embed(`**Music**
                    The music was ${player.volume !== 0 ? "unmuted" : "muted"} by **${i.user.username + "#" + i.user.discriminator}** [\`${i.user.id}\`]`)]
        }).then(msg => {
          i.fetchReply().then(msg => {
            setTimeout(() => {
              msg.delete().catch(err => { });
            }, 3000);
          })
        });
      }
    });
  });
}