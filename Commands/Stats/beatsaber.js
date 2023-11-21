let { getUser } = require("../../Utils/Database");
let { embed } = require("../../Utils/Embeds");
const { steamToken } = require("../../config.json");
const {
  ButtonBuilder,
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonStyle,
} = require("discord.js");

// Packages
const fetch = require("node-fetch");
const lookup = require("country-code-lookup");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("beatsaber")
    .setDescription("Check Beat Saber stats"),
  async execute(Acuity, interaction) {
    const buttonFilter = (i) =>
      i.message.id === msg.id && i.user.id === interaction.member.id;
    const msgFilter = (m) => m.user.id === interaction.user.id;

    const settingsRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("scoresaber")
        .setLabel("ScoreSaber")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("beatleader")
        .setLabel("BeatLeader")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("coremods")
        .setLabel("Quest Coremods")
        .setStyle(ButtonStyle.Primary)
    );

    interaction.reply({
      embeds: [
        embed(`**Beat Saber**
        What do you want to do?`),
      ],
      components: [settingsRow],
    });

    const collector = interaction.channel.createMessageComponentCollector({
      buttonFilter,
      time: 30000,
      max: 1,
    });
    collector.on("collect", async (i) => {
      if (i.customId === "coremods") {
        const settingsRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("getversion")
            .setLabel("Check Version")
            .setStyle(ButtonStyle.Primary)
        );

        i.update({
          embeds: [
            embed(`**Beat Saber | Quest Coremods**
                  Loading coremods...`),
          ],
          components: [],
        });

        const coremods = await fetch(
          "https://git.bmbf.dev/unicorns/resources/-/raw/master/com.beatgames.beatsaber/core-mods.json"
        ).then((data) => {
          return data.json();
        });

        const oculusDB = await fetch(
          "https://oculusdb.rui2015.me/api/v1/connected/2448060205267927"
        ).then((data) => {
          return data.json();
        });

        const versions = await fetch("https://raw.githubusercontent.com/Codinqq/BeatSaberStats/main/version.json").then((data) => {
          return data.json();
        });
        const reversedCoreMods = Object.keys(coremods).reverse();

        let coremods_Version = "";

        reversedCoreMods.forEach((key) => {
          coremods_Version += `\`${key}\` - **${coremods[key].mods.length}** core mods\n`;
        });

        i.editReply({
          embeds: [
            embed(`**Beat Saber | Quest Core-Mods**
                    These are the current versions which has BMBF core mods.
                    Latest Beat Saber version - **${versions.quest.latest}**
                    The current Beat Saber version **does ${
                      coremods[versions.quest.latest]
                        ? ""
                        : "not"
                    }** have core mods
        
                    List goes from **newest to oldest** version moddable by BMBF.
                    ${coremods_Version}`),
          ],
          components: [settingsRow],
        });

        const collector = interaction.channel.createMessageComponentCollector({
          buttonFilter,
          time: 30000,
          max: 1,
        });
        collector.on("collect", async (i) => {
          if (i.customId === "getversion") {
            Acuity.noLogs.set(
              `${interaction.guild.id}.${interaction.user.id}`,
              true
            );

            i.update({
              embeds: [
                embed(`**Beat Saber  | Quest Core-Mods**
              Which version do you want to search for?`),
              ],
              components: [],
            }).then(async (m) => {
              var msgCollector = i.channel.createMessageCollector({
                msgFilter,
                max: 1,
              });

              msgCollector.on("collect", async (x) => {
                let bmbfVersion = x.content;
                await x.delete();

                if (coremods[bmbfVersion]) {
                  let coremod = coremods[bmbfVersion].mods;

                  let coreModString = "";

                  for (var i in coremod) {
                    coreModString += `[${coremod[i].id}](${coremod[i].downloadLink}) - **${coremod[i].version}**\n`;
                  }

                  interaction
                    .editReply({
                      embeds: [
                        embed(`**Beat Saber | Quest Core-Mods**
                                        These are the coremods for version **${bmbfVersion}**.
                                        Last Updated - **${coremods[
                                          bmbfVersion
                                        ].lastUpdated
                                          .replace("T", " - ")
                                          .replace("Z", "")}**
                        
                                        ${coreModString}`),
                      ],
                      components: [],
                    })
                    .then(() =>
                      Acuity.noLogs.set(
                        `${interaction.guild.id}.${interaction.user.id}`,
                        false
                      )
                    );
                } else {
                  interaction
                    .editReply({
                      embeds: [
                        embed(`**Beat Saber | Quest Core-Mods**
                                        There are not any coremods for version \`${bmbfVersion}\`.
                                        `),
                      ],
                      components: [],
                    })
                    .then((m) => {
                      setTimeout(() => {
                        m.delete();
                      }, 3000);
                      Acuity.noLogs.set(
                        `${interaction.guild.id}.${interaction.user.id}`,
                        false
                      );
                    });
                }
              });
            });
          }
        });
      }
      if (i.customId === "scoresaber") {
        const body = await fetch("https://scoresaber.com/api/players/");
        const leaderboard = await body.json();

        let leaderboard_Text = "";

        for (var x = 0; x < 10; x++) {
          leaderboard_Text += `#${x + 1} - **${
            leaderboard.players[x].name
          }** [**${leaderboard.players[x].id}** - **${
            leaderboard.players[x].country
          }**]
                **${leaderboard.players[x].pp.toLocaleString(
                  `en-US`
                )}pp** - **${leaderboard.players[
            x
          ].scoreStats.totalRankedScore.toLocaleString(`en-US`)}**\n`;
        }

        const settingsRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("checkuserscoresaber")
            .setLabel("Check User")
            .setStyle(ButtonStyle.Primary)
        );

        i.update({
          embeds: [
            embed(`**ScoreSaber**
            ${leaderboard_Text}
        `),
          ],
          components: [settingsRow],
        }).then(async (m) => {
          const collector = interaction.channel.createMessageComponentCollector(
            {
              buttonFilter,
              time: 30000,
              max: 1,
            }
          );
          collector.on("collect", async (i) => {
            if (i.customId === "checkuserscoresaber") {
              Acuity.noLogs.set(
                `${interaction.guild.id}.${interaction.user.id}`,
                true
              );
              i.update({
                embeds: [
                  embed(`**ScoreSaber**
                    Who do you want to search up?
                    
                    You may either tag a user that has their Steam-ID set on their profile, send their Steam-ID or search for them by using their Vanity-Url.`),
                ],
                components: [],
              }).then(async (m) => {
                var msgCollector = i.channel.createMessageCollector({
                  msgFilter,
                  max: 1,
                });

                msgCollector.on("collect", async (x) => {
                  let user = x.content;
                  await x.delete();

                  if (user.includes("<@")) {
                    user = user.replace("<@", "").replace(">", "");
                  }

                  if (
                    interaction.guild.members.cache.find((c) => c.id === user)
                  ) {
                    let userDB = await getUser(user);

                    if (
                      userDB.settings.games.steamID !== "" ||
                      userDB.settings.games.steamID !== null
                    ) {
                      user = userDB.settings.games.steamID;
                    }
                  }

                  if (isNaN(user)) {
                    const body = await fetch(
                      `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${steamToken}&vanityurl=${user}`
                    );
                    const userinfo = await body.json();

                    if (userinfo.response.steamid) {
                      user = userinfo.response.steamid;
                    } else {
                      return interaction
                        .editReply({
                          embeds: [
                            embed(`**ScoreSaber**
                                  I tried to find that user on Steam but I couldn't find them!`),
                          ],
                        })
                        .then((m) => {
                          setTimeout(() => {
                            m.delete();
                          }, 3000);
                        });
                    }
                  }

                  const body = await fetch(
                    "https://scoresaber.com/api/player/" + user + "/full"
                  );
                  const userinfo = await body.json();

                  if (userinfo.errorMessage) {
                    Acuity.noLogs.set(
                      `${interaction.guild.id}.${interaction.user.id}`,
                      false
                    );
                    return interaction
                      .editReply({
                        embeds: [
                          embed(`**ScoreSaber**
                            I couldn't find that user on ScoreSaber!`),
                        ],
                      })
                      .then((m) => {
                        setTimeout(() => {
                          m.delete();
                        }, 3000);
                      });
                  }
                  await interaction
                    .editReply({
                      embeds: [
                        embed(`**ScoreSaber**
                                User - **${userinfo.name}** [**${userinfo.id}**]
                                Performance Points - **${userinfo.pp
                                  .toLocaleString(`en-US`)}pp**
                                Country - **${
                                  lookup.byIso(userinfo.country).country
                                }**
                        
                                **Stats**
                                Total Score - **${userinfo.scoreStats.totalScore.toLocaleString(
                                  `en-US`
                                )}**
                                Total Ranked Score - **${userinfo.scoreStats.totalRankedScore.toLocaleString(
                                  `en-US`
                                )}**
                                Ranked Play Count - **${userinfo.scoreStats.rankedPlayCount.toLocaleString(
                                  `en-US`
                                )}**
                                Average Ranked Accuracy - **${
                                  Math.round(
                                    (userinfo.scoreStats.averageRankedAccuracy +
                                      Number.EPSILON) *
                                      100
                                  ) / 100
                                }%**
                                Total Play Count - **${userinfo.scoreStats.totalPlayCount.toLocaleString(
                                  `en-US`
                                )}**
                                Replays Watched - **${userinfo.scoreStats.replaysWatched.toLocaleString(
                                  `en-US`
                                )}**
                        
                                **Ranks**
                                Global Rank - **#${userinfo.rank.toLocaleString(
                                  `en-US`
                                )}**
                                Country Rank - **#${userinfo.countryRank.toLocaleString(
                                  `en-US`
                                )}**`),
                      ],
                    })
                    .then(() =>
                      Acuity.noLogs.set(
                        `${interaction.guild.id}.${interaction.user.id}`,
                        false
                      )
                    );
                });
              });
            }
          });
        });
      }
      if (i.customId === "beatleader") {
        const body = await fetch(
          "https://api.beatleader.xyz/players?page=1&sortBy=pp"
        );
        const leaderboard = await body.json();

        let leaderboard_Text = "";

        for (var x = 0; x < 10; x++) {
          leaderboard_Text += `#${x + 1} -> **${
            leaderboard.data[x].name
          }** [**${leaderboard.data[x].id}** - **${
            leaderboard.data[x].country
          }**]
            **${leaderboard.data[x].pp.toLocaleString(
              `en-US`
            )}pp** - **${leaderboard.data[
            x
          ].scoreStats.totalScore.toLocaleString(`en-US`)}**\n`;
        }

        const settingsRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("checkuserbeatleader")
            .setLabel("Check User")
            .setStyle(ButtonStyle.Primary)
        );

        i.update({
          embeds: [
            embed(`**BeatLeader**
            ${leaderboard_Text}
        `),
          ],
          components: [settingsRow],
        }).then(async (m) => {
          const collector = interaction.channel.createMessageComponentCollector(
            {
              buttonFilter,
              time: 30000,
              max: 1,
            }
          );
          collector.on("collect", async (i) => {
            if (i.customId === "checkuserbeatleader") {
              Acuity.noLogs.set(
                `${interaction.guild.id}.${interaction.user.id}`,
                true
              );
              i.update({
                embeds: [
                  embed(`**BeatLeader**
                    Who do you want to search up?
                    
                    You may either tag a user that has their Steam-ID set on their profile, send their Steam-ID or search for them by using their Vanity-Url`),
                ],
                components: [],
              }).then(async (m) => {
                var msgCollector = i.channel.createMessageCollector({
                  msgFilter,
                  max: 1,
                });

                msgCollector.on("collect", async (x) => {
                  let user = x.content;
                  await x.delete();

                  if (user.includes("<@")) {
                    user = await user.replace("<@", "").replace(">", "");
                  }

                  if (
                    interaction.guild.members.cache.find((c) => c.id === user)
                  ) {
                    let userDB = await getUser(user);

                    if (
                      userDB.settings.games.steamID !== "" ||
                      userDB.settings.games.steamID !== null
                    ) {
                      user = userDB.settings.games.steamID;
                    }
                  }

                  if (isNaN(user)) {
                    const body = await fetch(
                      `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${steamToken}&vanityurl=${user}`
                    );
                    const userinfo = await body.json();

                    if (userinfo.response.steamid) {
                      user = userinfo.response.steamid;
                    } else {
                      return interaction
                        .editReply({
                          embeds: [
                            embed(`**BeatLeader**
                                  I tried to find that user on Steam but I couldn't find them!`),
                          ],
                        })
                        .then((m) => {
                          setTimeout(() => {
                            m.delete();
                          }, 3000);
                        });
                    }
                  }

                  const body = await fetch(
                    "https://api.beatleader.xyz/player/" + user
                  );
                  if (body.status === 400) {
                    Acuity.noLogs.set(
                      `${interaction.guild.id}.${interaction.user.id}`,
                      false
                    );

                    return interaction
                      .editReply({
                        embeds: [
                          embed(`**BeatLeader**
                            I couldn't find that user on BeatLeader!`),
                        ],
                      })
                      .then((m) => {
                        setTimeout(() => {
                          m.delete();
                        }, 3000);
                      });
                  }

                  const userinfo = await body.json();

                  await interaction
                    .editReply({
                      embeds: [
                        embed(`**BeatLeader**
                    User - **${userinfo.name}** [\`${userinfo.id}\`]
                    Performance Points - **${userinfo.pp
                      .toLocaleString(`en-US`)}pp**
                    Country - **${lookup.byIso(userinfo.country).country}**
            
                    **Stats**
                    Total Score - **${userinfo.scoreStats.totalScore.toLocaleString(
                      `en-US`
                    )}**
                    Ranked Play Count - **${userinfo.scoreStats.rankedPlayCount.toLocaleString(
                      `en-US`
                    )}**
                    Average Ranked Accuracy - **${(
                      userinfo.scoreStats.averageRankedAccuracy * 100
                    ).toFixed(2)}%**
                    Total Play Count - **${userinfo.scoreStats.totalPlayCount.toLocaleString(
                      `en-US`
                    )}**
            
                    **Ranks**
                    Global Rank - **#${userinfo.rank.toLocaleString(`en-US`)}**
                    Country Rank - **#${userinfo.countryRank.toLocaleString(
                      `en-US`
                    )}**`),
                      ],
                    })
                    .then(() =>
                      Acuity.noLogs.set(
                        `${interaction.guild.id}.${interaction.user.id}`,
                        false
                      )
                    );
                });
              });
            }
          });
        });
      }
    });
  },
};
