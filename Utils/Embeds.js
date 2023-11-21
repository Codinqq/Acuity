let { EmbedBuilder } = require("discord.js");
let { mainColor, errorColor, version, ownerID } = require("../config.json");
let { stripIndents } = require("common-tags");

let { Acuity } = require("../app");

module.exports.embed = function embed(description) {
    let embed = new EmbedBuilder()
      .setDescription(stripIndents`${description}\n\n\n`)
      .setColor(mainColor)
      .setFooter({
        text: `Acuity ${version} - Created by ${
          Acuity.users.cache.find((c) => c.id === ownerID).username +
          "#" +
          Acuity.users.cache.find((c) => c.id === ownerID)
            .discriminator
        }`,
        iconURL: Acuity.user.avatarURL(),
      });
    return embed;
  };
  
  module.exports.logs = function logs(type, member, author, channel, reason) {
    let embed = new EmbedBuilder()
      .setDescription(
        stripIndents`**Log - Punishment**
          Moderator - **${author.tag}
          Channel - ${channel}
  
          Punished - ${member.tag ? member.tag : member}
          Punishment - **${type}**
          Reason - **${reason}**`
      )
      .setColor(mainColor).setFooter({
        text: `Acuity ${version} - Created by ${
          Acuity.users.cache.find((c) => c.id === ownerID).username +
          "#" +
          Acuity.users.cache.find((c) => c.id === ownerID)
            .discriminator
        }`,
        iconURL: Acuity.user.avatarURL(),
      });
  
    return embed;
  };
  
  module.exports.user = function user(type, moderator, guild, reason) {
    let embed = new EmbedBuilder()
      .setDescription(
        stripIndents`
      **Log - Punishment**
      Moderator - **${moderator.username + "#" + moderator.discriminator}**
      Guild - **${guild.name}**
      
      Type - **${type}**
      Reason - **${reason}**`
      )
      .setColor(mainColor).setFooter({
        text: `Acuity ${version} - Created by ${
          Acuity.users.cache.find((c) => c.id === ownerID).username +
          "#" +
          Acuity.users.cache.find((c) => c.id === ownerID)
            .discriminator
        }`,
        iconURL: Acuity.user.avatarURL(),
      });
    return embed;
  };
  
  module.exports.automod = function automod(module, member, channel, message) {
    let embed = new EmbedBuilder()
      .setDescription(
        stripIndents`
       **Log - Automod**
      Module triggered - **${module}**
      Channel - ${channel}
  
      Punished - **${member.tag}**
      Message - **${message}**`
      )
      .setColor(mainColor).setFooter({
        text: `Acuity ${version} - Created by ${
          Acuity.users.cache.find((c) => c.id === ownerID).username +
          "#" +
          Acuity.users.cache.find((c) => c.id === ownerID)
            .discriminator
        }`,
        iconURL: Acuity.user.avatarURL(),
      });
    return embed;
  };
  
  module.exports.noPerms = function noPerms(permission) {
    let embed = new EmbedBuilder()
      .setDescription(
        stripIndents`
    **No Perms**
    Permission needed - **${permission}**`
      )
      .setColor(errorColor)
      .setFooter({
        text: `If this is an issue, please contact the administrators of the guild.`,
        iconURL: Acuity.user.avatarURL()
      });
    return embed;
  };