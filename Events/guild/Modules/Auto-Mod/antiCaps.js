let { getGuild } = require("../../../../Utils/Database");
let { embed, automod, user } = require("../../../../Utils/Embeds");

const { PermissionFlagsBits } = require("discord.js");
module.exports.run = async (Acuity, message) => {
    let guild = await getGuild(message.guild.id)


        if (!guild) return;
        if(!message.member) return;

            if (message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return;

            if(guild.addons.automod.exempt.roles.length > 0 && guild.addons.automod.exempt.roles != undefined) {
                for(var i in guild.addons.automod.exempt.roles) {
                    if(message.member.roles.cache.find(r => r.id === guild.addons.automod.exempt.roles[i])) return;
                }
            } 

            if(guild.addons.automod.exempt.users.length > 0 && guild.addons.automod.exempt.users != undefined) {
                if(guild.addons.automod.exempt.users.includes(message.author.id)) return;
            }

            if (guild.addons.automod.noCaps) {

                let nonCapsMessage = message.content.replace(/[^A-Z]/g, "");
                let capsMessage = message.content.replace(/[^a-z]/g, "");

                if (nonCapsMessage.length > capsMessage.length / 2) {

                    if(!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
                        return message.channel.send({embeds: [embed(`**Error - Anti-Caps**\nThe bot doesn't have permissions to delete messages, so the automod doesn't work properly.`)]}).then((m) => {
                            setTimeout(() => {
                              m.delete();
                            }, 10000);
                          })
                    }

                    message.delete();
                    

                    message.author.send({embeds: [user(`Anti-Caps`, message.guild.members.me, message.guild, "Too many capitalized letters in the message.")]}).catch(() => {
                        message.channel.send({embeds: [embed(`**Auto-Mod** 
                        ${message.author} - Stop using too many capital letters!`)]}).then((m) => {
                            setTimeout(() => {
                              m.delete();
                            }, 5000);
                          })
                    });

                    let logChannel = message.guild.channels.cache.find(c => c.id === guild.settings.channels.botLogs);
                    if (!logChannel) return;

                    return logChannel.send({embeds: [automod(`Anti-Caps`, message.author, message.channel, message)]});

                }
            }
}