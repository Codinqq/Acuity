let { getGuild } = require("../../../../Utils/Database");
let { embed, automod, user } = require("../../../../Utils/Embeds");
const nodefetch = require("node-fetch")
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

            if (guild.addons.automod.noSwear) {
                nodefetch(`https://www.purgomalum.com/service/containsprofanity?text=${message}`).then(res => res.text()).then(body => {
                    if (body === "true") {
                        
                        if(!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
                            return message.channel.send({embeds: [embed(`────| **Error - Anti-Swear** |────\nThe bot doesn't have permissions to delete messages, so the automod doesn't work properly.`)]}).then((m) => {
                                setTimeout(() => {
                                  m.delete();
                                }, 10000);
                              })
                        }
                        
                        message.delete();

                        message.author.send({embeds: [user(`Anti-Swear`, message.guild.members.me, message.guild, "You triggered the anti-swear module!")]});

                        let logChannel = message.guild.channels.cache.find(c => c.id === guild.settings.channels.botLogs);
                        if (!logChannel) return;

                        return logChannel.send({embeds: [automod(`Anti-Swear`, message.author, message.channel, "Swear-word was found")]});
                    } else {
                        if(guild.addons.automod.exempt.words.length > 0) {

                            function checkWords(number) {

                                if(!guild.addons.automod.exempt.words[number]) return;

                                if(message.content.toLowerCase().includes(guild.addons.automod.exempt.words[number])) {
                                    if(!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
                                        return message.channel.send({embeds: [embed(`────| **Error** |────\nThe bot doesn't have permissions to delete messages, so the automod doesn't work properly.`)]}).then((m) => {
                                            setTimeout(() => {
                                              m.delete();
                                            }, 10000);
                                          })
                                    }
                                        message.delete();
                                    
            
                                    message.author.send({embeds: [user(`Anti-Swear`, message.guild.members.me, message.guild, "You triggered the anti-swear module!")]}).catch(() => {
                                        message.channel.send({embeds: [embed(`────| **Auto-Mod** |──── 
                                        ${message.author} - Stop swearing!`)]}).then((m) => {
                                            setTimeout(() => {
                                              m.delete();
                                            }, 5000);
                                          })
                                    });
            
                                    let logChannel = message.guild.channels.cache.find(c => c.id === guild.settings.channels.botLogs);
                                    if (!logChannel) return;
            
                                    return logChannel.send({embeds: [automod(`Anti-Swear`, message.author, message.channel, "Swear-word was found")]});
                                } else if(guild.addons.automod.exempt.words[number++]){
                                    checkWords(number++);
                                } else {
                                    return;
                                }
                            }
                            checkWords(0)
                        }
                    }
                })
            }
}