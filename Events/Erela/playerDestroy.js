const { embed } = require("../../Utils/Embeds");

module.exports = async (Acuity, manager, player) => {

    let textChannel = Acuity.channels.cache.get(player.textChannel);
    textChannel.messages.fetch(player.currentPlayingMsg).then(msg => {if(msg) {msg.delete()}});

    textChannel.send({embeds: [embed(`────| **Music** |────
    The queue was finished, I am now leaving the voice-channel.
    If you want to play more music, use the \`/play <search-term>\` command.`)]}).then(msg => {
        setTimeout(() => {
            msg.delete();
        }, 5000);
    });

}