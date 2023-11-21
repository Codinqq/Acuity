const {inDevelopment, debugEnabled} = require("../../config.json");

module.exports = async (Acuity, debug) => {

      if(inDevelopment && debugEnabled) console.log("Debug | " + debug);
 
}