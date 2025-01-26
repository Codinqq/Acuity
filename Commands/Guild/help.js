let { embed } = require("../../Utils/Embeds");
const {
  SlashCommandBuilder,
} = require("discord.js");
const fs = require("fs");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Information about the different commands Acuity has.")
    .addStringOption((option) =>
      option
        .setName("command")
        .setDescription("The command you want more information about.")
        .setRequired(false)
    )
    .setDMPermission(true),
  execute: async (Acuity, interaction) => {
    let commands = [];

    const load = (dirs) => {
        const cmds = fs
          .readdirSync(`./Commands/${dirs}/`)
          .filter((d) => d.endsWith(".js"));
        let cCommands = { category: dirs, commands: [] };

        for (let file of cmds) {
          const cmdPull = require(`../${dirs}/${file}`);
          cCommands.commands.push(cmdPull.data.toJSON());
        }

        commands.push(cCommands);
    };
    ["Guild", "Staff", "Stats", "Utilities"].forEach((e) => load(e));
    let commandName = interaction.options.getString("command");

    if (commandName && commandName.length > 0) {
      for (var i in commands) {
        for (var a in commands[i].commands) {
          if (commands[i].commands[a].name === commandName) {
            interaction.reply({
              embeds: [
                embed(`**Help**
                        Name - \`${commands[i].commands[a].name}\`
                        Description - \`${commands[i].commands[a].description}\`
                        Category - \`${commands[i].category}\``),
              ],
            });
          }
        }
      }
    } else {
      var commandString = "";

      let emojis = ["📜", "⚔️", "🎮", "⚙️"];

      for (var i in commands) {
        let commandNames = [];

        for (var a in commands[i].commands) {
          commandNames.push(commands[i].commands[a].name);
        }

        commandString += `${emojis[i]} **${
          commands[i].category
        }**\n\`${commandNames.join("` - `")}\`\n\n`;
      }

      interaction.reply({
        embeds: [
          embed(`**Help**\n
            ${commandString}`),
        ],
      });
    }
  },
};
