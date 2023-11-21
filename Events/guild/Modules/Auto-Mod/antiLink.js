let { getGuild } = require("../../../../Utils/Database");
let { embed, automod, user } = require("../../../../Utils/Embeds");
const validUrl = require('valid-url');
const { PermissionFlagsBits } = require("discord.js");

module.exports.run = async (Acuity, message) => {
        let guild = await getGuild(message.guild.id)
 
        if(!guild) return;

        let args = message.content.trim().split(/ +/g);

        let isURL = false;
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

        for(var i in args) {
            if (validUrl.isUri(args[i].toString())){
                isURL = true;
            } 
        }

            if (guild.addons.automod.noLinks) {
                    if (isURL === true) {
                        if(guild.addons.automod.exempt.links.length === 0) {
                            if(!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
                                return message.channel.send({embeds: [embed(`**Error - Anti-Links** \nThe bot doesn't have permissions to delete messages, so the Auto-Mod won't work.`)]}).then((m) => {
                                    setTimeout(() => {
                                      m.delete();
                                    }, 10000);
                                  })
                            }
                            
                            message.delete();
                            

                            message.author.send({embeds: [user(`Anti-Links`, message.guild.members.me, message.guild, "You had an unauthorized link in your message.")]}).catch(() => {
                                message.channel.send({embeds: [embed(`**Auto-Mod**
                                I couldn't send a message to ${message.author}, as they don't have direct-messages enabled.`)]}).then((m) => {
                                    setTimeout(() => {
                                      m.delete();
                                    }, 5000);
                                  })
                            });
    
                            let logChannel = message.guild.channels.cache.find(c => c.id === guild.settings.channels.botLogs);
                            if (!logChannel) return;
                            logChannel.send({embeds: [automod(`Anti-Links`, message.author, message.channel, message)]});

                        } else {
                            function checkLinks(number) {
                                if(!guild.addons.automod.exempt.links[number]) return;
                                
                                if(message.content.includes(guild.addons.automod.exempt.links[number])) {

                                    return;

                                } else if(number == guild.addons.automod.exempt.links.length && !message.content.includes(guild.addons.automod.exempt.links[number])) {

                                    if(!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
                                        return message.channel.send({embeds: [embed(`**Error - Anti-Links**\nThe bot doesn't have permissions to delete messages, so the Auto-Mod won't work.`)]}).then((m) => {
                                            setTimeout(() => {
                                              m.delete();
                                            }, 10000);
                                          })
                                    }
                                    
                                    message.delete();
                                    
                                    message.author.send({embeds: [user(`Anti-Links`, message.guild.members.me, message.guild, "You had an unauthorized link in your message.")]});
            
                                    let logChannel = message.guild.channels.cache.find(c => c.id === guild.settings.channels.botLogs);
                                    if (!logChannel) return;
                                    logChannel.send({embeds: [automod(`Anti-Links`, message.author, message.channel, message)]});

                                } else {
                                    if(!message.guild.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
                                        return message.channel.send({embeds: [embed(`**Error - Anti-Links**\nThe bot doesn't have permissions to delete messages, so the Auto-Mod won't work.`)]}).then((m) => {
                                            setTimeout(() => {
                                              m.delete();
                                            }, 10000);
                                          })
                                    }
                                        message.delete();
                                    
            
                                    message.author.send(user(`Anti-Links`, message.channel, "You had an unauthorized link in your message.")).catch(() => {
                                        message.channel.send({embeds: [embed(`**Auto-Mod** 
                                        ${message.author} - Stop sending links that are not allowed!`)]}).then((m) => {
                                            setTimeout(() => {
                                              m.delete();
                                            }, 5000);
                                          })
                                    });
            
                                    let logChannel = message.guild.channels.cache.find(c => c.id === guild.settings.channels.botLogs);
                                    if (!logChannel) return;
                                    logChannel.send({embeds: [automod(`Anti-Links`, message.author, message.channel, message)]});

                                    checkLinks(number++);
                                }


                            }

                            checkLinks(0);

                        }
                    }
            }
}