const {erelaEnabled} = require("../../config.json");

module.exports = async (Acuity, d) => {

    if(erelaEnabled) Acuity.manager.updateVoiceState(d);

}