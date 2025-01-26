let { getGuild, getGuildUser } = require("../../../../Utils/Database");

module.exports.run = async (Acuity, message) => {
        
    var db = await getGuild(message.guild.id);
    let user = await getGuildUser(message.author.id, message.guild.id);

                if (db.addons.levels.enabled) {
                    if (Acuity.xpTimeout.get(`${message.guild.id}.${message.author.id}`) === false || !Acuity.xpTimeout.get(`${message.guild.id}.${message.author.id}`)) {
                        let randomNumbers = Math.round(Math.random() * 10);

                        user.settings.level.xp = user.settings.level.xp + randomNumbers;

                        Acuity.xpTimeout.set(`${message.guild.id}.${message.author.id}`, true);
                        setTimeout(() => {
                            Acuity.xpTimeout.set(`${message.guild.id}.${message.author.id}`, false);
                        }, 30000);


                        user.save().catch(err => console.log(err));
                    }
                }
    let addLevel = require("./addLevel.js");
    addLevel.run(Acuity, message);
}