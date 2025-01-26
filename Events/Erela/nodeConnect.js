const { inDevelopment } = require("../../config.json");

module.exports = async (Acuity, manager, node) => {
    console.log(`Acuity ${ inDevelopment ? "Development " : "" }| Erela.js - Successfully accomplished contact with Lavalink.`);
}