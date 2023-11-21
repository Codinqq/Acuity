const fs = require("fs");
const {erelaEnabled} = require("../config.json");

module.exports = (Acuity, manager) => {
 
    if(erelaEnabled) {
        const events = fs.readdirSync(`./Events/Erela/`).filter(d => d.endsWith('.js'));
        for (let file of events) {
            const eventPull = require(`../Events/Erela/${file}`);
            let eventName = file.split(".")[0];
            manager.on(eventName, eventPull.bind(null, Acuity, manager));
        }
    }     
}