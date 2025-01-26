const Notification = require("../../../../Models/notifications");
const { WebhookClient } = require("discord.js");

const { twitchToken } = require("../../../../config.json");
const { embed } = require("../../../../Utils/Embeds");
const {getAdmin} = require("../../../../Utils/Database");
const TwitchApi = require("node-twitch").default;

async function chechTwitch() {

  const twitch = new TwitchApi({
    client_id: "CLIENT_ID",
    client_secret: twitchToken
  });

  Notification.find({ type: "Twitch" }, async (err, results) => {
    for (var i in results) {
      let user = await twitch.getUsers(results[i].channel.toLowerCase())
      user = user.data[0];

      let stream = await twitch.getStreams({channel: user.login});
      stream = stream.data[0];

      let webhook = new WebhookClient({ url: results[i].webhook });

      webhook.fetchMessage().catch(err => {
        if(err.code === 10015) return Notification.findOneAndDelete({webhook: results[i].webhook, channel: results[i].channel});
      })

      if (
        stream &&
        results[i].streaming.isStreaming === false
      ) {
        results[i].streaming.isStreaming = true;

        webhook.send({
          username: user.display_name + " - Live",
          avatarURL: user.profile_image_url,
          content: (results[i].roleToMention !== undefined ? `<@&${results[i].roleToMention}>` : ""),
          embeds: [
            embed(`**Twitch Live**
                        ${user.display_name} is live playing ${stream.game_name}!

                        **${stream.title}**
                        [Go to live](https://twitch.tv/${user.display_name})`).setThumbnail(
              user.profile_image_url
            ).setImage(stream.thumbnail_url),
          ],
        }).catch((err) => {
          return Notification.findOneAndDelete({webhook: results[i].webhook, channel: results[i].channel});
        }).then(async (msg) => {
          if(results[i].streaming.removeWhenDone) {            
            results[i].streaming.messageID = msg.id;
          }
          results[i].save().catch(err => console.log(err));

        })

      } else if (
        !stream &&
        results[i].streaming.isStreaming
      ) {

        if(results[i].streaming.removeWhenDone && results[i].streaming.messageID !== "") await webhook.deleteMessage(results[i].streaming.messageID).catch((err) => {});
        results[i].streaming.messageID = "";
        results[i].streaming.isStreaming = false;
        await results[i].save().catch(err => console.log(err));
      }
    }
  });
}

module.exports.run = async (Acuity) => {
  
  setInterval(async () => {
    let adminSettings = await getAdmin();

    if(!adminSettings.disabled.commands.includes("notification")){
      chechTwitch();
    }
    
  }, 10 * 60000);

  chechTwitch();
};
