# Acuity

A Discord bot made in [Discord.js v14](https://discord.js.org/).

Warning: When developing the bot, it wasn't meant to be open-sourced, so there's little to no comments and multiple changes to be made.
It also has a lot of bugs that crashes the bot.

### Installing

This program requires [Node.js](https://nodejs.org/)

- Download the zip file & extract it.
- Open a terminal, go into the folder using `cd Acuity-master`.
- Write `npm install` to install the npm packages.


### Config.json
In the config.json file, you may edit the different settings of Acuity.

- mainColor: The color to be used on the line to the left on the embeds.
- errorColor: The color to be used on the line to the left on the embeds, when there's an error.

- token: The normal Discord Bot token you'll use for the bot.
- betaToken: The token you will use for a Test Bot.
- steamToken: A Steam token so you may search for Steam users.
- mongoose: A MongoDB URI that the bot should connect to.
  
- version: The version of the bot.
- inDevelopment: Disabled different functions when the bot is in development mode. This disables updating the API.
- debugEnabled: Get more information from Discord.js
- erelaEnabled: Toggle the music commands.
- twitchToken: To fetch data from Twitch Channels, required for notifications.

```
{
    "mainColor": "#404040",
    "errorColor": "#c62828",
    "token": "BOTTOKEN",
    "betaToken": "BOTTOKEN",
    "steamToken": "STEAMTOKEN",
    "mongoose": "MONGODB URI",
    "version": "1.0.0",
    "inDevelopment": false,
    "debugEnabled": false,
    "erelaEnabled": false,
    "twitchToken": "TWITCHTOKEN"
} 
```


### Running the bot

When in a terminal window, which is in the folder, write `node app.js`.
Tip: Install [Nodemon](https://www.npmjs.com/package/nodemon) to automatically restart the bot when files have been changed.
