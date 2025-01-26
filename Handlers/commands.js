const fs = require("fs");
const { REST, Routes } = require("discord.js");
const { token, betaToken, inDevelopment, erelaOn } = require("../config.json");

module.exports = (Acuity) => {
  let commands = [];

  const rest = new REST({ version: "10" }).setToken(
    inDevelopment ? betaToken : token
  );

  async function register() {
    console.log(`Acuity ${ inDevelopment ? "Development " : "" }| Currently registering commands`);
    try {
        await rest.put(Routes.applicationCommands(Acuity.id), {
          body: commands,
        });

      console.log(`Acuity ${ inDevelopment ? "Development " : "" }| Successfully registered the commands`);
    } catch (err) {
      return console.log(err.stack);
    }
  }

  const load = (dirs) => {
      const cmds = fs
        .readdirSync(`./Commands/${dirs}/`)
        .filter((d) => d.endsWith(".js"));
      for (let file of cmds) {
        const cmdPull = require(`../Commands/${dirs}/${file}`);
        commands.push(cmdPull.data.toJSON());

        Acuity.commands.set(cmdPull.data.name, cmdPull);
      }

      console.log(`Acuity ${ inDevelopment ? "Development " : "" }| Successfully loaded the commands from ${dirs}`);

      if (dirs === "Utilities") register();
  };

  [
    "Admin-Tools",
    "Guild",
    "Music",
    "Staff",
    "Stats",
    "Utilities",
  ].forEach((e) => load(e));
};
