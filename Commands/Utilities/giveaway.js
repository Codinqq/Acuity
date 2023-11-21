let { embed, noPerms } = require("../../Utils/Embeds");
const ms = require("ms");
const { stripIndents } = require("common-tags");
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveaway")
    .setDescription("Create an giveaway")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  execute: async (Acuity, interaction) => {
    let winnerResp = "";

    let winnerArray = [];

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages))
      return interaction.reply({ embeds: [noPerms("Manage Messages")] }).then((m) =>
        interaction.fetchReply().then((m) => {
          setTimeout(() => {
            m.delete();
          }, 3000);
        })
      );

    interaction
      .reply({
        embeds: [
          embed(`**Giveaway**
            What do you want to giveaway?
            
            You may also cancel the creator, by responding with **cancel** to this message.`),
        ],
        ephemeral: true,
      })
      .then((m) => {
        let filter = (msg) => msg.author.id === interaction.user.id;
        Acuity.noLogs.set(
          `${interaction.guild.id}.${interaction.user.id}`,
          true
        );

        interaction.fetchReply().then((m) => {
          let mCollector = m.channel.createMessageCollector({
            filter,
            max: 1,
            time: 30000,
          });

          mCollector.on("collect", async (resp) => {
            let giveawayItem = resp.content;
            resp.delete();
            if (giveawayItem.toLowerCase() === "cancel") {
              Acuity.noLogs.set(
                `${interaction.guild.id}.${interaction.user.id}`,
                false
              );
              return interaction.editReply({
                embeds: [
                  embed(`**Giveaway**                    
                        Successfully cancelled the giveaway setup.`),
                ],
                ephemeral: true,
              });
            }

            interaction
              .editReply({
                embeds: [
                  embed(`**Giveaway**                
                    Giveaway-Item - **${giveawayItem}**
                    
                    How many winners are there going to be?
                    
                    You may also cancel the creator, by responding with **cancel** to this message.`),
                ],
                ephemeral: true,
              })
              .then((m) => {
                interaction.fetchReply().then((m) => {
                  mCollector = m.channel.createMessageCollector({
                    filter,
                    max: 1,
                    time: 30000,
                  });

                  mCollector.on("collect", async (resp) => {
                    let winners = resp.content;
                    resp.delete();
                    if (resp.content.toLowerCase() === "cancel") {
                      Acuity.noLogs.set(
                        `${interaction.guild.id}.${interaction.user.id}`,
                        false
                      );
                      return interaction.editReply({
                        embeds: [
                          embed(`**Giveaway**                            
                                Successfully cancelled the giveaway setup.`),
                        ],
                        ephemeral: true,
                      });
                    }

                    if (!isNaN(winners)) {
                      interaction
                        .editReply({
                          embeds: [
                            embed(`**Giveaway**                            
                                Giveaway-Item - **${giveawayItem}**
                                Winners - **${winners}**
                                
                                How long do you want the giveaway to run for?
                                
                                You may also cancel the creator, by responding with **cancel** to this message.`),
                          ],
                          ephemeral: true,
                        })
                        .then((m) => {
                          interaction.fetchReply().then((m) => {
                            mCollector = m.channel.createMessageCollector({
                              filter,
                              max: 1,
                              time: 30000,
                            });

                            mCollector.on("collect", async (resp) => {
                              if (resp.content.toLowerCase() === "cancel") {
                                Acuity.noLogs.set(
                                  `${interaction.guild.id}.${interaction.user.id}`,
                                  false
                                );
                                return interaction.editReply({
                                  embeds: [
                                    embed(`**Giveaway**                                        
                                            Successfully cancelled the giveaway setup.`),
                                  ],
                                  ephemeral: true,
                                });
                              }

                              let time = ms(resp.content);
                              resp.delete();

                              if (time < 2000) {
                                return interaction.editReply({
                                  embeds: [
                                    embed(`**Giveaway**                                        
                                            The giveaway needs to run for over 10 seconds.`),
                                  ],
                                  ephemeral: true,
                                });
                              }

                              let giveawayChannel =
                                interaction.guild.channels.cache.find(
                                  (c) => c.name === "giveaway"
                                );
                              if (!giveawayChannel)
                                giveawayChannel = interaction.channel;

                              if (
                                !interaction.guild.members.me
                                  .permissionsIn(giveawayChannel)
                                  .has("ADD_REACTIONS")
                              ) {
                                return interaction.editReply({
                                  embeds: [
                                    embed(`**Giveaway**            
                                    I do not have permission to add reactions in the ${giveawayChannel} channel
                                    
                                    Please let me be able to add reactions in that channel before trying again`),
                                  ],
                                  ephemeral: true,
                                });
                              }

                              interaction.editReply({
                                embeds: [
                                  embed(`**Giveaway**
                    The giveaway has started in ${giveawayChannel}`),
                                ],
                                ephemeral: true,
                              });

                              giveawayChannel
                                .send({
                                  embeds: [
                                    embed(`**Giveaway**
                                        Giveaway-Item - **${giveawayItem}**
                                        Winners - **${winners}**
                                        
                                        The giveaway will be over **<t:${Math.floor(
                                          Date.now() / 1000 + time / 1000
                                        )}:R>**
                                        Time choosing - **<t:${Math.floor(
                                          Date.now() / 1000 + time / 1000
                                        )}>**`),
                                  ],
                                })
                                .then((m) => {
                                  Acuity.noLogs.set(
                                    `${interaction.guild.id}.${interaction.user.id}`,
                                    false
                                  );

                                  m.react("🎉");

                                  setTimeout(async () => {
                                    m = await m.fetch(true);
                                    if (
                                      m.reactions.cache.get("🎉").count - 1 ===
                                      0
                                    ) {
                                      m.channel.send({
                                        embeds: [
                                          embed(`**Giveaway**                                                
                                                    I couldn't draw a winner, as there wasn't enough people that had reacted.`),
                                        ],
                                      });
                                      await m.reactions.removeAll();
                                    } else {
                                      async function chooseWinners(
                                        winnersDrawn
                                      ) {
                                        let winner = await m.reactions.cache
                                          .get("🎉")
                                          .users.fetch()
                                          .then((c) =>
                                            c.filter((u) => !u.bot).random()
                                          );
                                        let reactionArray =
                                          await m.reactions.cache
                                            .get("🎉")
                                            .users.fetch()
                                            .then((c) =>
                                              c.filter((u) => !u.bot)
                                            );

                                        if (
                                          reactionArray.size < Number(winners)
                                        ) {
                                          if (
                                            winnersDrawn === reactionArray.size
                                          ) {
                                            m.edit({
                                              embeds: [
                                                embed(`**Giveaway**                                                    
                                                                    Giveaway-Item - **${giveawayItem}**
                                                                    Winners - ${winnerResp}
                                                                    Contestants - ${reactionArray.size}
                                                                    
                                                                    Time left - **Ended**`),
                                              ],
                                            });
                                            let link = `<https://discordapp.com/channels/${interaction.guild.id}/${giveawayChannel.id}/${m.id}>`;
                                            await m.reactions.removeAll();

                                            return giveawayChannel.send({
                                              content: stripIndents`🎉 Congratulations ${winnerResp}, you just won **${giveawayItem}**! 🎉`,
                                              embed: embed(
                                                `[Go to message](${link})`
                                              ),
                                            });
                                          }

                                          if (winnerArray.includes(winner.id)) {
                                            return chooseWinners(winnersDrawn);
                                          } else if (winnersDrawn === 0) {
                                            winnerResp += `${winner}`;
                                            winnerArray.push(winner.id);
                                            return chooseWinners(
                                              winnersDrawn + 1
                                            );
                                          } else if (
                                            winnersDrawn != 0 &&
                                            reactionArray.size != winnersDrawn
                                          ) {
                                            winnerResp += `, ${winner}`;
                                            winnerArray.push(winner.id);
                                            return chooseWinners(
                                              winnersDrawn + 1
                                            );
                                          }
                                        } else {
                                          if (
                                            winnersDrawn === Number(winners)
                                          ) {
                                            m.edit({
                                              embeds: [
                                                embed(`**Giveaway**                                                    
                                                                    Giveaway-Item - **${giveawayItem}**
                                                                    Winners - ${winnerResp}
                                                                    Contestants - ${reactionArray.size}
                                                                    
                                                                    Time left - **Ended**`),
                                              ],
                                            });
                                            let link = `<https://discordapp.com/channels/${interaction.guild.id}/${giveawayChannel.id}/${m.id}>`;
                                            await m.reactions.removeAll();

                                            return giveawayChannel.send({
                                              content: stripIndents`🎉 Congratulations ${winnerResp}, you just won **${giveawayItem}**! 🎉`,
                                              embed: embed(
                                                `[Go to message](${link})`
                                              ),
                                            });
                                          }

                                          if (winnerArray.includes(winner.id)) {
                                            return chooseWinners(winnersDrawn);
                                          } else if (winnersDrawn === 0) {
                                            winnerResp += `${winner}`;
                                            winnerArray.push(winner.id);
                                            return chooseWinners(
                                              winnersDrawn + 1
                                            );
                                          } else if (winnersDrawn !== 0) {
                                            winnerResp += `, ${winner}`;
                                            winnerArray.push(winner.id);
                                            return chooseWinners(
                                              winnersDrawn + 1
                                            );
                                          }
                                        }
                                      }
                                      chooseWinners(0);
                                      clearInterval(Timer);
                                    }
                                  }, time);
                                });
                            });
                          });
                        });
                    }
                  });
                });
              });
          });
        });
      });
  },
};
