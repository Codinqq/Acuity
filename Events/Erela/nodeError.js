const { inDevelopment } = require("../../config.json");

module.exports = async (Acuity, manager, error) => {
    console.log(`Acuity ${ inDevelopment ? "Development " : "" }| Erela.js - ${error.message}`);
}