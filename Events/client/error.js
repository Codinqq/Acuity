const { inDevelopment } = require("../../config.json");

module.exports = async (Acuity, error) => {

    console.log(`Acuity ${ inDevelopment ? "Development " : "" }- Error | ${error}`);

}