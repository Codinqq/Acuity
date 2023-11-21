let { getAdmin } = require("../../Utils/Database");
let { embed } = require("../../Utils/Embeds");

let { inDevelopment } = require("../../config.json");

module.exports = async(Acuity, interaction) => {

    let adminSettings = await getAdmin();
    
    if(adminSettings.isInMaintenance && interaction.commandName !== "admin") {
        return interaction.reply({embeds: [embed(`**Maintenance Mode**
        Acuity is currently in maintenance mode, due to some issues.
        Please join the Support server for more information. 
        [Click here to join](https://acuity.codinq.xyz/discord)`)]});
    } else {
        let commandFile = Acuity.commands.get(interaction.commandName);

        if(adminSettings.disabled.commands.includes(interaction.commandName) && interaction.commandName !== "admin" && !inDevelopment) {
            return interaction.reply({embeds: [embed(`**Disabled Command**
                The \`${interaction.commandName}\` command is disabled due to issues with it.
                Please join the Support server for more information. 
                [Click here to join](https://acuity.codinq.xyz/discord)`)]});
        } else {
            if(commandFile) commandFile.execute(Acuity, interaction)
        }
    }
}