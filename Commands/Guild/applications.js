let { embed } = require("../../Utils/Embeds");
const titleize = require("titleize");
const Application = require("../../Models/applications");
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ButtonStyle,
  ButtonBuilder,
  ActionRowBuilder,
} = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("applications")
    .setDescription("Create, edit or remove applications!")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  execute: async (Acuity, interaction) => {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return interaction.reply({ embeds: noPerms("Administrator") });

    let appRes = "";
    Application.find(
      {
        guildID: interaction.guild.id,
      },
      async (err, applications) => {
        for (var i in applications) {
          appRes += `\`${titleize(applications[i].name)}\`\n`;
        }
      }
    );
    const buttonFilter = (i) =>
      i.message.id === msg.id && i.user.id === interaction.member.id;
    const settingsRow1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("createButton")
        .setLabel("Create Application")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("editButton")
        .setLabel("Edit Application")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("removeButton")
        .setLabel("Remove Application")
        .setStyle(ButtonStyle.Danger),
    );

    interaction
      .reply({
        embeds: [
          embed(`**Applications** |────
      Welcome to the application configurator. Here you may create, remove or edit an application!

      To continue, please click one of the buttons below.`),
        ],
        fetchReply: true, components: [settingsRow1]})
      .then(async (msg) => {
        Acuity.noLogs.set(
          `${interaction.guild.id}.${interaction.member.user.id}`,
          true
        );
        const reactFilter = (reaction, user) =>
          user.id === interaction.member.user.id;
        const msgFilter = (m) => m.author.id === interaction.member.user.id;
        await interaction.fetchReply().then((msg) => {
        const collector = interaction.channel.createMessageComponentCollector({
          buttonFilter,
          time: 30000,
          max: 1,
        });
        collector.on("collect", async (i) => {

          if (i.customId === "createButton") {
            let questionArray = [];
            i
              .update({
                embeds: [
                  embed(`**Applications** |────
                      What do you want the name of the application to be?
                      
                      You may also cancel the configurator, by responding with **cancel** to this message.`),
                ],
                fetchReply: true,
                components: []
              })
              .then((msg) => {
                var msgCollector = msg.channel.createMessageCollector({
                  msgFilter,
                  max: 1,
                  maxProcessed: 1
                });

                msgCollector.on("collect", async (response) => {
                  let name = response.content.toLowerCase();
                  response.delete();
                  if (response.content.toLowerCase() === "cancel") {
                    interaction.editReply({
                      embeds: [
                        embed(`**Applications** |────
                                  You successfully cancelled the application configurator`),
                      ],
                    });
                    return interaction.fetchReply().then(async (m) =>{
                      Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)

                      setTimeout(() => {
                        m.delete();
                      }, 5000)
                    });
                  }

                  let application = await Application.findOne({guildID: interaction.guild.id, name:name});

                  if(application){
                    interaction.editReply({
                      embeds: [
                        embed(`**Applications** |────
                                  An application with that name already exists.`),
                      ],
                    });
                    return interaction.fetchReply().then(async (m) =>
                      setTimeout(() => {
                        m.delete();
                      }, 5000)
                    );
                  }


                  interaction
                    .editReply({
                      embeds: [
                        embed(`**Applications**                               
                      Name - **${name}**.
                      
                      Please respond to the message with how many questions you want to have in the application.                                

                      You may also cancel the configurator, by responding with **cancel** to this message.`),
                      ],
                    })
                    .then((msg) => {
                      msgCollector = interaction.channel.createMessageCollector(
                        {
                          msgFilter,
                          max: 1,
                          maxProcessed: 1
                        }
                      );
                      msgCollector.on("collect", async (response) => {
                        if (response.content.toLowerCase() === "cancel") {
                          interaction.editReply({
                            embeds: [
                              embed(`**Applications** |────
                                          You successfully cancelled the application configurator`),
                            ],
                          });
                          return interaction.fetchReply().then(async (m) =>{
                            Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)

                            setTimeout(() => {
                              m.delete();
                            }, 5000)
                        });
                        }
                        let questions = response.content;
                        response.delete();
                        if (isNaN(questions)) {
                          interaction.editReply({
                            embeds: [
                              embed(`**Applications**                                   
                                          You didn't specify a real number.
                                          
                                          Please run the application command again, and respond with a number.`),
                            ],
                          });
                          interaction.fetchReply().then(async (m) =>{
                            Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                            setTimeout(() => {
                              m.delete();
                            }, 5000)}
                          );
                        }
                        questions = Number(questions);

                        function addQuestion(questions, number) {
                          if (number === questions) {
                            const newConfig = new Application({
                              guildID: interaction.guild.id,
                              name: name,
                              questions: questionArray,
                            });

                            newConfig.save().catch((err) => console.log(err));
                            Acuity.noLogs.set(
                              `${interaction.guild.id}.${interaction.member.user.id}`,
                              false
                            );

                            interaction.editReply({
                              embeds: [
                                embed(`**Applications**                                               
                                              The application process is now done.`),
                              ],
                            });
                            return interaction.fetchReply().then(async (m) =>
                              setTimeout(() => {
                                m.delete();
                              }, 5000)
                            );
                          }

                          let stringApp = "";

                          for (var i in questionArray) {
                            stringApp += `${Number(i) + 1}. **${
                              questionArray[i]
                            }**\n`;
                          }

                          interaction.editReply({
                            embeds: [
                              embed(`**Applications**                                           
                                          Currently creating the **${name}** application.

                                          ${stringApp}

                                          You're now on question **${
                                            number + 1
                                          }/${questions}**
                                          You'll now have to respond to the message with the next question.

                                          You may also cancel the configurator, by responding with **cancel** to this message.`),
                            ],
                          });

                          msgCollector =
                            interaction.channel.createMessageCollector({
                              msgFilter,
                              max: 1,
                              maxProcessed: 1
                            });
                          msgCollector.on("collect", async (resp) => {
                            if (resp.content.toLowerCase() === "cancel") {
                              interaction.editReply({
                                embeds: [
                                  embed(`**Applications** |────
                                                  You successfully cancelled the application configurator`),
                                ],
                              });
                              return interaction.fetchReply().then(async (m) =>{
                                Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)

                                setTimeout(() => {
                                  m.delete();
                                }, 5000)}
                              );
                            }
                            await resp.delete();
                            questionArray.push(resp.content);
                            number++;
                            await addQuestion(questions, number);
                          });
                        }
                        addQuestion(questions, 0);
                      });
                    });
                });
              });
          }
          if (i.customId === "editButton") {

            if (appRes === "" || !appRes) {
              i.update({
                embeds: [
                  embed(`**Applications**                                   
                            This guild doesn't have any applications!

                            Please create an application before using this part of the configurator!`),
                ],
                components: []
              });
              interaction.fetchReply().then(async (m) =>{
                Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                setTimeout(() => {
                  m.delete();
                }, 5000)}
              );
            }

            const settingsRow1 = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId("renameButton")
                .setLabel("Rename Application")
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId("replaceButton")
                .setLabel("Edit a question")
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId("addButton")
                .setLabel("Add a question")
                .setStyle(ButtonStyle.Danger),
            );

            i
              .update({
                embeds: [
                  embed(`**Applications**                       
                      What do you want to do?

                      To continue, please click one of the buttons below.`),
                ],
                fetchReply: true,
                components: [settingsRow1]
              })
              .then(async (msg) => {

                const collector = interaction.channel.createMessageComponentCollector({
                  buttonFilter,
                  time: 30000,
                  max: 1,
                });
                collector.on("collect", async (i) => {

                  
                  if (i.customId === "renameButton") {
                    i
                      .update({
                        embeds: [
                          embed(`**Applications**                                       
                                      Which of the applications do you want to rename?
                                      
                                      Please respond to the message with the application name.
                                      ${appRes}`),
                        ],
                        components: []
                      })
                      .then((msg) => {
                        let msgCollector =
                          interaction.channel.createMessageCollector({
                            msgFilter,
                            max: 1,
                            maxProcessed: 1
                          });

                        msgCollector.on("collect", async (response) => {
                          let appName = response.content.toLowerCase();
                          response.delete();

                          if (response.content.toLowerCase() === "cancel") {
                            interaction.editReply({
                              embeds: [
                                embed(`**Applications** |────
                                              You successfully cancelled the application configurator`),
                              ],
                            });
                            return interaction.fetchReply().then(async (m) =>{
                              Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false);
                              setTimeout(() => {
                                m.delete();
                              }, 5000);
                            });
                          }

                          Application.findOne(
                            {
                              guildID: interaction.guild.id,
                              name: appName,
                            },
                            async (err, app) => {
                              if (!app) {
                                Acuity.noLogs.set(
                                  `${interaction.guild.id}.${interaction.member.user.id}`,
                                  false
                                );
                                interaction.editReply({
                                  embeds: [
                                    embed(`**Applications**                                                       
                                                      I couldn't find the application with the name **${appName}**.

                                                     Please restart the configurator again, and type the right name.`),
                                  ],
                                });
                                interaction.fetchReply().then(async (m) =>
                                  setTimeout(() => {
                                    m.delete();
                                  }, 5000)
                                );
                              }

                              interaction
                                .editReply({
                                  embeds: [
                                    embed(`**Applications**                                                   
                                                  What do you want the application renamed to?

                                                  Please respond to the message with the new name.`),
                                  ],
                                })
                                .then((msg) => {
                                  msgCollector =
                                    interaction.channel.createMessageCollector({
                                      msgFilter,
                                      max: 1,
                                      maxProcessed: 1
                                    });

                                  msgCollector.on(
                                    "collect",
                                    async (response) => {
                                      response.delete();

                                      if (
                                        response.content.toLowerCase() ===
                                        "cancel"
                                      ) {
                                        interaction.editReply({
                                          embeds: [
                                            embed(`**Applications** |────
                                                          You successfully cancelled the application configurator`),
                                          ],
                                        });
                                        return interaction
                                          .fetchReply()
                                          .then(async (m) =>{
                                            Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)

                                            setTimeout(() => {
                                              m.delete();
                                            }, 5000)
                                          });
                                      }

                                      let newName =
                                        response.content.toLowerCase();

                                      interaction.editReply({
                                        embeds: [
                                          embed(`**Applications**                                                           
                                                          I successfully edited the application name for \`${appName}\` to \`${newName}\``),
                                        ],
                                      });
                                      interaction.fetchReply().then(async (m) =>{
                                        Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                                        setTimeout(() => {
                                          m.delete();
                                        }, 5000)}
                                      );

                                      app.name = newName;
                                      app
                                        .save()
                                        .catch((err) => console.log(err));
                                    }
                                  );
                                });
                            }
                          );
                        });
                      });
                  }
                  if (i.customId === "replaceButton") {
                    i
                      .update({
                        embeds: [
                          embed(`**Applications**                                           
                                          In which application is the question you want to edit?

                                          Please respond to the message with the application name.
                                          ${appRes}`),
                        ],
                        components: []
                      })
                      .then((msg) => {
                        let msgCollector =
                          interaction.channel.createMessageCollector({
                            msgFilter,
                            max: 1,
                            maxProcessed: 1
                          });

                        msgCollector.on("collect", async (response) => {
                          let app = response.content.toLowerCase();
                          response.delete();

                          if (response.content.toLowerCase() === "cancel") {
                            interaction.editReply({
                              embeds: [
                                embed(`**Applications** |────
                                              You successfully cancelled the application configurator`),
                              ],
                            });
                            return interaction.fetchReply().then(async (m) =>{
                              Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)

                              setTimeout(() => {
                                m.delete();
                              }, 5000)
                            });
                          }

                          Application.findOne(
                            {
                              guildID: interaction.guild.id,
                              name: app,
                            },
                            async (err, app) => {
                              if (!app) {
                                Acuity.noLogs.set(
                                  `${interaction.guild.id}.${interaction.member.user.id}`,
                                  false
                                );
                                interaction.editReply({
                                  embeds: [
                                    embed(`**Applications**                                                       
                                                      I couldn't find the application with the name **${app}**.

                                                      Please restart the configurator again, and type the right name.`),
                                  ],
                                });
                                interaction.fetchReply().then(async (m) =>
                                  setTimeout(() => {
                                    m.delete();
                                  }, 5000)
                                );
                              }

                              let questionRes = "";

                              for (var i in app.questions) {
                                questionRes += `[${Number(i) + 1}] **${
                                  app.questions[i]
                                }**\n`;
                              }

                              interaction
                                .editReply({
                                  embeds: [
                                    embed(`**Applications**                                                       
                                                      Which question do you want to edit?
                                                      
                                                      Please respond to the message with the number of the question you want to edit.

                                                      ${questionRes}`),
                                  ],
                                })
                                .then((msg) => {
                                  msgCollector =
                                    interaction.channel.createMessageCollector({
                                      msgFilter,
                                      max: 1,
                                      maxProcessed: 1
                                    });

                                  msgCollector.on(
                                    "collect",
                                    async (response) => {
                                      response.delete();

                                      if (
                                        response.content.toLowerCase() ===
                                        "cancel"
                                      ) {
                                        interaction.editReply({
                                          embeds: [
                                            embed(`**Applications** |────

                                                          You successfully cancelled the application configurator`),
                                          ],
                                        });
                                        return interaction
                                          .fetchReply()
                                          .then(async (m) =>{
                                            Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                                            setTimeout(() => {
                                              m.delete();
                                            }, 5000)
                                          });
                                      }

                                      let question =
                                        Number(response.content) - 1;

                                      if (isNaN(question)) {

                                        interaction.editReply({
                                          embeds: [
                                            embed(`**Applications**                                                                   
                                                                  You didn't define a valid number.

                                                                  Please restart the configurator again, and type a valid number.`),
                                          ],
                                        });
                                        interaction
                                          .fetchReply()
                                          .then(async (m) =>{
                                            Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                                            setTimeout(() => {
                                              m.delete();
                                            }, 5000)}
                                          );
                                      }

                                      if (question > app.questions.length) {
                                        interaction.editReply({
                                          embeds: [
                                            embed(`**Applications**                                                                   
                                                                  I couldn't find that question.

                                                                  Please restart the configurator again, and type the right number.`),
                                          ],
                                        });
                                        interaction
                                          .fetchReply()
                                          .then(async (m) =>{
                                            Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)

                                            setTimeout(() => {
                                              m.delete();
                                            }, 5000)}
                                          );
                                      }

                                      interaction
                                        .editReply({
                                          embeds: [
                                            embed(`**Applications**                                                               
                                                              Currently editing \`${app.questions[question]}\`.
                                                              
                                                              Please respond to the message with the new question.`),
                                          ],
                                        })
                                        .then((msg) => {
                                          msgCollector =
                                            interaction.channel.createMessageCollector(
                                              {
                                                msgFilter,
                                                max: 1,
                                                maxProcessed: 1
                                              }
                                            );

                                          msgCollector.on(
                                            "collect",
                                            async (response) => {
                                              response.delete();

                                              let newQuestion =
                                                response.content;

                                              if (
                                                response.content.toLowerCase() ===
                                                "cancel"
                                              ) {
                                                interaction.editReply({
                                                  embeds: [
                                                    embed(`**Applications** |────
                                                                  You successfully cancelled the application configurator`),
                                                  ],
                                                });
                                                return interaction
                                                  .fetchReply()
                                                  .then(async (m) =>{
                                                    Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)

                                                    setTimeout(() => {
                                                      m.delete();
                                                    }, 5000)
                                                  });
                                              }

                                              interaction.editReply({
                                                embeds: [
                                                  embed(`**Applications**                                                                       
                                                                      I successfully edited the question from \`${app.questions[question]}\` to \`${newQuestion}\``),
                                                ],
                                              });
                                              interaction
                                                .fetchReply()
                                                .then(async (m) =>
                                                  setTimeout(() => {
                                                    m.delete();
                                                  }, 5000)
                                                );

                                              let array = [];

                                              for (var i in app.questions) {
                                                array.push(app.questions[i]);
                                              }

                                              array[question] = newQuestion;
                                              app.questions = array;

                                              return app
                                                .save()
                                                .catch((err) =>
                                                  console.log(err)
                                                ).then(() => {
                                                  Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                                                });
                                            }
                                          );
                                        });
                                    }
                                  );
                                });
                            }
                          );
                        });
                      });
                  }

                  if (i.customId === "addButton") {
                    i
                      .update({
                        embeds: [
                          embed(`**Applications**                                           
                                          In which application do you want the new question to be?

                                          Please respond to the message with the application name.
                                          ${appRes}`),
                        ],
                        components: []
                      })
                      .then((msg) => {
                        let msgCollector =
                          interaction.channel.createMessageCollector({
                            msgFilter,
                            max: 1,
                            maxProcessed: 1
                          });

                        msgCollector.on("collect", async (response) => {
                          let appName = response.content.toLowerCase();
                          response.delete();

                          if (response.content.toLowerCase() === "cancel") {
                            interaction.editReply({
                              embeds: [
                                embed(`**Applications** |────
                                              You successfully cancelled the application configurator`),
                              ],
                            });
                            return interaction.fetchReply().then(async (m) =>{
                              Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)

                              setTimeout(() => {
                                m.delete();
                              }, 5000)
                            });
                          }

                          Application.findOne(
                            {
                              guildID: interaction.guild.id,
                              name: appName,
                            },
                            async (err, app) => {
                              if (!app) {
                                Acuity.noLogs.set(
                                  `${interaction.guild.id}.${interaction.member.user.id}`,
                                  false
                                );
                                interaction.editReply({
                                  embeds: [
                                    embed(`**Applications**                                                       
                                                      I couldn't find the application with the name **${appName}**.

                                                      Please restart the configurator again, and type the right name.`),
                                  ],
                                });
                                interaction.fetchReply().then(async (m) =>
                                  setTimeout(() => {
                                    m.delete();
                                  }, 5000)
                                );
                              }

                              interaction
                                .editReply({
                                  embeds: [
                                    embed(`**Applications**                                                       
                                                      What do you want the question to be?`),
                                  ],
                                })
                                .then((msg) => {
                                  msgCollector =
                                    interaction.channel.createMessageCollector({
                                      msgFilter,
                                      max: 1,
maxProcessed: 1
                                    });

                                  msgCollector.on(
                                    "collect",
                                    async (response) => {
                                      response.delete();

                                      if (
                                        response.content.toLowerCase() ===
                                        "cancel"
                                      ) {
                                        interaction.editReply({
                                          embeds: [
                                            embed(`**Applications** |────
                                                          You successfully cancelled the application configurator`),
                                          ],
                                        });
                                        return interaction
                                          .fetchReply()
                                          .then(async (m) =>{
                                            Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)

                                            setTimeout(() => {
                                              m.delete();
                                            }, 5000)
                                          });
                                      }

                                      let newQuestion = response.content;

                                      app.questions.push(newQuestion);

                                      interaction.editReply({
                                        embeds: [
                                          embed(`**Applications**                                                               
                                                              The question \`${newQuestion}\` has been added to \`${titleize(
                                            appName
                                          )}\``),
                                        ],
                                      });
                                      interaction.fetchReply().then(async (m) =>{
                                        Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                                        setTimeout(() => {
                                          m.delete();
                                        }, 5000)}
                                      );
                                      return app
                                        .save()
                                        .catch((err) => console.log(err));
                                    }
                                  );
                                });
                            }
                          );
                        });
                      });
                  }
                });
              });
          }
          if (i.customId === "removeButton") {
            i
              .update({
                embeds: [
                  embed(`**Applications**                   
                  Which application do you want to remove?

                  Please respond to the message with the application name.
                  ${appRes}`),
                ],
              })
              .then((msg) => {
                let msgCollector = interaction.channel.createMessageCollector({
                  msgFilter,
                  max: 1,
                  maxProcessed:1
                });
                msgCollector.on("collect", async (response) => {
                  let appName = response.content.toLowerCase();
                  response.delete();

                  if (response.content.toLowerCase() === "cancel") {
                    interaction.editReply({
                      embeds: [
                        embed(`**Applications** |────
                                  You successfully cancelled the application configurator`),
                      ],
                    });
                    return interaction.fetchReply().then(async (m) =>{
                      Acuity.noLogs.set(`${interaction.guild.id}.${interaction.member.user.id}`,false)
                      setTimeout(() => {
                        m.delete();
                      }, 5000)
                    });
                  }

                  Application.findOneAndDelete(
                    {
                      guildID: interaction.guild.id,
                      name: appName,
                    },
                    async (err, app) => {
                      if (!app) {
                        Acuity.noLogs.set(
                          `${interaction.guild.id}.${interaction.member.user.id}`,
                          false
                        );
                        interaction.editReply({
                          embeds: [
                            embed(`**Applications**                                                       
                                          I couldn't find the application with the name **${appName}**.

                                          Please restart the configurator again, and type the right name.`),
                          ],
                        });
                        interaction.fetchReply().then(async (m) =>
                          setTimeout(() => {
                            m.delete();
                          }, 5000)
                        );
                      } else {
                        Acuity.noLogs.set(
                          `${interaction.guild.id}.${interaction.user.id}`,
                          false
                        );
                        interaction.editReply({
                          embeds: [
                            embed(`**Applications**                           
                                  The \`${titleize(
                                    appName
                                  )}\` application has been removed.`),
                          ],
                        });
                        interaction.fetchReply().then(async (m) =>
                          setTimeout(() => {
                            m.delete();
                          }, 5000)
                        );
                      }
                    }
                  );
                });
              });
          }
        });
      });
      });
  },
};
