let { getGuild, getGuildUser } = require("../../../../Utils/Database");
let { embed } = require("../../../../Utils/Embeds");

const math = require("mathjs");
const { PermissionFlagsBits } = require("discord.js");
module.exports.run = async (Acuity, message) => {
    let guild = await getGuild(message.guild.id)
    let user = await getGuildUser(message.author.id, message.guild.id);

                if (user.settings.level.xp >= math.evaluate(user.settings.level.level * 300)) {
                    user.settings.level.level = user.settings.level.level + 1;
                    let lvlmessage = guild.addons.levels.levelupMessage;
                    lvlmessage = lvlmessage.replace("[LEVEL]", user.settings.level.level).replace("[USER]", message.author.tag).replace("[XP]", user.settings.level.xp).replace("[LEVEL]", user.settings.level.level).replace("[USER]", message.author.tag).replace("[XP]", user.settings.level.xp);
                    let reward = "";

                    if(guild.addons.levels.rewards.length > 0 && message.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
                        for (var r = 0; r < guild.addons.levels.rewards.length; r++) {
                            if (guild.addons.levels.rewards[r].level === user.settings.level.level) {
                                let rewardRole = message.guild.roles.cache.find(role => role.id === guild.addons.levels.rewards[r].rewardID);
                                await message.member.roles.add(rewardRole);
                                reward = `**This user was rewarded with the ${rewardRole} role!**`
                            }
                            
                        }
                    }

                    if(!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
                        reward = `**You should've gotten a role on this level, but since I do not have the permission I require to give you the role, you didn't get the role.**`
                    }

                    await message.channel.send({embeds: [embed(`**Levels**
                            ${lvlmessage}
                            ${reward}`)]}).then(m => 
                                setTimeout(() => {
                                    m.delete()
                                },7000));
                    return await user.save().catch(err => console.log(err));

                }
}