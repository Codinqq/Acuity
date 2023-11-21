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

            if (guild.addons.automod.noSpam) {
                let number = Acuity.antiSpam.get(message.author.id);

                if (isNaN(number)) number = 0;

                Acuity.antiSpam.set(message.author.id, number + 1);

                if (number + 1 === 5) {
                    
                    if(!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
                        return message.channel.send({embeds: [embed(`**Error - Anti-Spam**\nThe bot doesn't have permissions to delete messages, so the Auto-Mod won't work.`)]}).then(m => setTimeout(() => {
                            m.delete();
                          }, 10000))
                    }

                        message.channel.bulkDelete(5);
                    
                    message.author.send({embeds: [user(`Anti-Spam`, message.guild.members.me, message.guild, "You sent too many messages in 5 seconds.")]}).catch(() => {
                        message.channel.send({embeds: [embed(`**Auto-Mod** 
                        ${message.author} - Stop spamming!`)]})
                    }).then((m) => {
                        setTimeout(() => {
                            m.delete();
                          }, 3000);
                    });

                    Acuity.antiSpam.set(message.author.id, 0);

                    let logChannel = message.guild.channels.cache.find(c => c.id === guild.settings.channels.botLogs);
                    if (!logChannel) return;
                    return logChannel.send({embeds: [automod(`Anti-Spam`, message.author, message.channel, "Sent too many messages in 5 seconds")]});
                } else {
                    setTimeout(() => {
                        if (Acuity.antiSpam.get(message.author.id) != 0) {
                            Acuity.antiSpam.set(message.author.id, Acuity.antiSpam.get(message.author.id) - 1);
                        }
                    }, 5000);
                }
            }
}