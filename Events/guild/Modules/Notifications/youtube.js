const Notification = require("../../../../Models/notifications");
let { embed } = require("../../../../Utils/Embeds");
const {getAdmin} = require("../../../../Utils/Database");

const { WebhookClient, Webhook } = require("discord.js");
const { youtube } = require('scrape-youtube');
let { parse } = require("node-html-parser");
let Parser = require("rss-parser");
let axios = require("axios");

let parser = new Parser();

async function chechYoutube() {
  Notification.find({ type: "YouTube" }, async (err, results) => {
    for (var i in results) {

      let channelHtml;
      let canonicalURL;
      let canonicalURLTag;
      let isStreaming;

      await axios(
        `https://www.youtube.com/channel/${results[i].channel}/live`
      )
      .catch(err => {return isStreaming === null})
      .then(response => response.data)
      .then(async html => {
        channelHtml = parse(html);
        canonicalURLTag = channelHtml.querySelector("link[rel=canonical]");
        canonicalURL = canonicalURLTag.getAttribute("href");
        isStreaming = canonicalURL.includes("/watch?v=");
      });
      
      let rssHTML;
      let rss;
      let channelVideos;

      await axios(
        `https://www.youtube.com/channel/${results[i].channel}`
      )
      .catch(err => {return channelVideos = null})
      .then(res => res.data)
      .then(async html => {
        rssHTML = parse(html);
        rss = rssHTML.querySelector("link[title=RSS]").getAttribute("href");
        channelVideos = await parser.parseURL(rss);
      });
      
      let channel = await youtube.search(results[i].channel, {type: "channel"});
      channel = channel.channels[0];

      let webhook = new WebhookClient({ url: results[i].webhook });
      webhook.fetchMessage().catch(err => {
        if(err.code === 10015) return Notification.findOneAndDelete({webhook: results[i].webhook, channel: results[i].channel});
      })
      
      if (results[i].streaming.isStreaming !== isStreaming && isStreaming !== null) {
        results[i].streaming.isStreaming = isStreaming;
        if (results[i].streaming.isStreaming) {
          webhook.send({
            username: channel.name + " - Live",
            avatarURL: channel.thumbnail,
            content: (results[i].roleToMention !== "" ? `<@&${results[i].roleToMention}>` : ""),
            embeds: [
              embed(`**YouTube Live**
                        ${channel.name} is live!
                        [Go to live](${channel.url})`).setThumbnail(
                  channel.thumbnail
              ),
            ],
          }).catch(err => {
            return Notification.findOneAndDelete({
              webhook: results[i].webhook,
              channel: results[i].channel,
            });
          }).then(async (msg) => {
            if(results[i].streaming.removeWhenDone) {
              results[i].streaming.messageID = msg.id;
            }
          });
        } else {

          if(results[i].streaming.removeWhenDone) webhook.fetchMessage(results[i].streaming.messageID).delete();

        }
        results[i].streaming.isStreaming = isStreaming;
        results[i].save().catch((err) => console.log(err));
      }
      if(channelVideos === null) return;

      if (channelVideos.items[0].link !== results[i].latest) {
        results[i].latest = channelVideos.items[0].link;
        results[i].save().catch((err) => console.log(err));
        webhook.send({
          username: channel.name + " - New Video",
          avatarURL: channel.thumbnail,
          content: (results[i].roleToMention !== null ? `<@&${results[i].roleToMention}>` : ""),
          embeds: [
            embed(`**YouTube - New Video**
                        ${channel.name} just uploaded a new video!

                        **${channelVideos.items[0].title}**
                        [Go to video](${channelVideos.items[0].link})`)
              .setThumbnail(channel.thumbnail )
              .setImage(
                `https://img.youtube.com/vi/${channelVideos.items[0].id.slice(
                  9
                )}/maxresdefault.jpg`
              ),
          ],
        }).catch(err => {
          return Notification.findOneAndDelete({
            webhook: results[i].webhook,
            channel: results[i].channel,
          });
        });
      }
    }
  });
}

module.exports.run = async (Acuity) => {

  setInterval(async () => {
    let adminSettings = await getAdmin();

    if(!adminSettings.disabled.commands.includes("notification")){
      chechYoutube();
    }
    
  }, 10 * 60000);

  chechYoutube();
};
