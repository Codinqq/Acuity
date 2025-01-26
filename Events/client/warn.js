
const { inDevelopment } = require("../../config.json");
module.exports = async (Acuity, warn) => {

    console.log(`Acuity ${ inDevelopment ? "Development " : "" }- Warning | ${warn}`);

}