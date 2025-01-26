let { getGuild } = require("../../Utils/Database");

module.exports = async (Acuity, guild) => {

  let guildDB = await getGuild(guild.id);

  if(guildDB.settings.blacklisted === true) return guild.leave();

};
