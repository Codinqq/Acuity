const fs = require("fs");

module.exports = (Acuity) => {
    const load = (dirs) => {
            const events = fs.readdirSync(`./Events/${dirs}/`).filter(d => d.endsWith('.js'));
            for (let file of events) {
                const eventPull = require(`../Events/${dirs}/${file}`);
                let eventName = file.split(".")[0];
                Acuity.on(eventName, eventPull.bind(null, Acuity));
            }
        }
        ["client", "guild"].forEach(e => load(e));
}