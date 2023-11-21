const axios = require("axios");
const { version, inDevelopment, erelaEnabled } = require("../../config.json");
const youtube = require("../guild/Modules/Notifications/youtube");
const twitch = require("../guild/Modules/Notifications/twitch");

const {getAdmin} = require("../../Utils/Database");
const config = require("../../config.json")

module.exports = async (Acuity) => {
  
  if (erelaEnabled) Acuity.manager.init(Acuity.user.id);

  console.log(`Acuity ${ inDevelopment ? "Development " : "" }| Successfully booted up.`);

  if (!inDevelopment) {
      let users = Acuity.users.cache.size;
      let guilds = Acuity.guilds.cache.size;

      axios({
        method: "post",
        url: "API URL",
        params: {
          auth: "PASSWORD",
          servers: guilds,
          users: users,
          version: version,
        },
      }).then(
        (response) => {
          console.log(`Acuity ${ inDevelopment ? "Development " : "" }| ${response.data.response}`);
        },
        (error) => {
          console.log(`Acuity${ inDevelopment ? "Development " : "" }- Error | ${error}`);
        }
      )

    setInterval(() => {
          let users = Acuity.users.cache.size;
          let guilds = Acuity.guilds.cache.size;

          axios({
            method: "post",
            url: "API URL",
            params: {
              auth: "PASSWORD",
              servers: guilds,
              users: users,
              version: version,
            },
          }).then(
            (response) => {
              console.log(`Acuity ${ inDevelopment ? "Development " : "" }| ${response.data.response}`);
            },
            (error) => {
              if (!error) return;
              console.log(`Acuity ${ inDevelopment ? "Development " : "" }- Error | ${error}`);
            }
          );
    }, 300000);
  }

  let adminSettings = await getAdmin();

  if(!adminSettings.disabled.commands.includes("notifications") || config.inDevelopment) {
    youtube.run(Acuity);
    twitch.run(Acuity);
  }

  if(adminSettings.isInMaintenance) Acuity.user.setPresence({status: "dnd", activities: [{type: 0, name: "Maintenance Mode"}]});
  if(!adminSettings.isInMaintenance) Acuity.user.setPresence({status: adminSettings.status.status, activities: [{type: adminSettings.status.activity, name: adminSettings.status.message.replaceAll('[VERSION]', config.version).replaceAll('[GUILDS]', Acuity.guilds.cache.size).replaceAll('[USERS]', Acuity.users.cache.size), url: "https://www.twitch.tv/codinq"}]});

};
