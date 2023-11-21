let { embed } = require("../../Utils/Embeds");
const Application = require("../../Models/applications");
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("apply")
    .setDescription("Send an application to the staff members!")
    .setDMPermission(false),
  execute: async (Acuity, interaction) => {
    await Application.find(
      {
        guildID: interaction.guild.id,
      },
      async (err, applications) => {
        let appChannel = interaction.guild.channels.cache.find(
          (c) => c.name === "applications"
        );

        if (!appChannel) {
          return interaction.reply({
            embeds: [
              embed(`**Applications**                               
                I couldn't find the #applications channel in the server you're applying in.
                
                If you see this, please report this to one of the Server Administrators in **${interaction.guild.name}**`),
            ],
            ephemeral: true,
          });
        }

        if (
          !interaction.guild.members.me
            .permissionsIn(appChannel)
            .has(PermissionFlagsBits.SendMessages)
        ) {
          return interaction.reply({
            embeds: [
              embed(`**Applications**                               
                I do not have access to the #applications channel!
                
                If you see this, please report this to one of the Server Administrators in **${interaction.guild.name}**`),
            ],
            ephemeral: true,
          });
        }

        if (applications.map((r) => `\`${r.name}\``).join(" - ") === "")
          return interaction.reply({
            embeds: [
              embed(`**Applications**       
        There currently isn't any applications that you can apply for.

        If you think this is a issue, please contact the server administrators, so they can look into the issue.`),
            ],
            ephemeral: true,
          });

        interaction.reply({
          embeds: [
            embed(`**Applications** |────
        Check your dms!`),
          ],
          ephemeral: true,
        });

        interaction.user
          .send({
            embeds: [
              embed(`**Applications** |────
        Which application do you want to do?
        
        Please respond with one of the names down below.
        ${applications.map((r) => `\`${r.name}\``).join(" - ")}`),
            ],
          })
          .then((msg) => {
            const msgFilter = (msg) => msg.user.id === interaction.user.id;
            var msgCollector = msg.channel.createMessageCollector({
              msgFilter,
              max: 1,
            });

            msgCollector.on("collect", async (collected) => {
              Application.findOne(
                {
                  guildID: interaction.guild.id,
                  name: collected.content.toLowerCase(),
                },
                async (err, app) => {
                  if (!app)
                    return msg
                      .edit({
                        embeds: [
                          embed(`**Applications**                   
                    This server doesn't have any applications with the name of **${collected.content}**!
                    
                    Please try again, or if it's an issue that occurs again, you can get help from the bot-developers at [the official Support Server](https://discord.gg/ehMs7q7)`),
                        ],
                      })
                      .then((m) =>
                        setTimeout(() => {
                          m.delete();
                        }, 3000)
                      );

                  let questionsArray = [];

                  function questions(number) {
                    if (number === app.questions.length) {
                      let questionRes = "";
                      appChannel.send({
                        embeds: [
                          embed(`**Applications** |────
                        
                        Applicant - ${
                          interaction.user.username +
                          "#" +
                          interaction.user.discriminator
                        } [<@${interaction.user.id}>] 
                        Application answered - **${app.name}**
                        
                        `),
                        ],
                      });

                      for (var i in questionsArray) {
                        appChannel.send({
                          embeds: [
                            embed(`
                              ${app.questions[i]}
                              \`${questionsArray[i]}\`
                              
                              ${Number(i) === questionsArray.length-1 ? "This was the final question.": ""}`),
                          ],
                        });
                      }

                      return interaction.user
                        .send({
                          embeds: [
                            embed(`**Applications**                           
                            I successfully sent the application to the server!
                            
                            You should get an response soon, please be patient!`),
                          ],
                        })
                        .then((m) =>
                          setTimeout(() => {
                            m.delete();
                          }, 3000)
                        );
                    } else {
                      interaction.user
                        .send({
                          embeds: [
                            embed(`**Applications** |────
                            **${app.questions[number]}**
                            
                            Respond to this message with your answer.`),
                          ],
                        })
                        .then((msg) => {
                          var msgCollector = msg.channel.createMessageCollector(
                            { msgFilter, max: 1 }
                          );
                          msgCollector.on("collect", async (collected) => {
                            questionsArray.push(collected.content);

                            number++;
                            questions(number);
                          });
                        });
                    }
                  }

                  questions(0);
                }
              );
            });
          })
          .catch((err) => {
            return interaction.editReply({
              embeds: [
                embed(`**Applications** |────
            I do not have access to DM you, please enable \`Direct Messages\` under your Privacy Settings in this server.`),
              ],
            });
          });
      }
    );
  },
};
