const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
let { embed } = require("../../Utils/Embeds");

const levels = {
  none: 0.0,
  less: -0.25,
  low: 0.10,
  medium: 0.15,
  high: 0.25,
  earrape: 1
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bassboost")
    .setDescription("Bass boost the songs.")
    .setDMPermission(false),
  execute: async (Acuity, interaction) => {
    const player = Acuity.manager.players.get(interaction.guild.id);

    if (!player)
      return interaction.reply({
        embeds: [
          embed(`**Music**        
          This is the Bass Boost command, where you may bass boost songs.
          
          Sadly there's no music playing in this guild.
          
          To play some music, use - \`/play <search-term / link>\``),
        ],
        ephemeral: true,
      });

    const { channel } = interaction.member.voice;
    if (!channel) {
      return interaction.reply({
        embeds: [
          embed(`**Music**            
              You aren't in a voice channel.
              
              Please join a voice-channel before executing the command again.`),
        ],
        ephemeral: true,
      });
    }
    if (channel.id !== player.voiceChannel) {
      return interaction.reply({
        embeds: [
          embed(`**Music**            
              You aren't in the same voice-channel as Acuity
              
              Please join the right voice-channel before executing the command again.`),
        ],
        ephemeral: true,
      });
    }

    if (player.paused)
      return interaction.reply({
        embeds: [
          embed(`**Music**            
            The music is currently paused.`),
        ],
        ephemeral: true,
      });

    let options = [];

    if (interaction.user.id === "740213771179524187") {
      options = [{
        label: "Less",
        description: "Remove some bass",
        value: "less",
      },
      {
        label: "No Bass Boost",
        description: "Remove bass boost",
        value: "none",
      },
      {
        label: "Level 1",
        description: "Level 1 Bass Boost",
        value: "low",
      },
      {
        label: "Level 2",
        description: "Level 2 Bass Boost",
        value: "medium",
      },
      {
        label: "Level 3",
        description: "Level 3 Bass Boost",
        value: "high",
      },
      {
        label: "Earrape",
        description: "Oh no",
        value: "earrape",
      },

      ]
    } else {
      options = [{
        label: "Less",
        description: "Remove some bass",
        value: "less",
      },
      {
        label: "No Bass Boost",
        description: "Remove bass boost",
        value: "none",
      },
      {
        label: "Level 1",
        description: "Level 1 Bass Boost",
        value: "low",
      },
      {
        label: "Level 2",
        description: "Level 2 Bass Boost",
        value: "medium",
      },
      {
        label: "Level 3",
        description: "Level 3 Bass Boost",
        value: "high",
      },
      ]
    }



    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("selectbass")
        .setPlaceholder("What do you want the level of bass to be?")
        .addOptions(options)
    );

    const selFilter = (i) =>
      i.message.id === msg.id && i.user.id === interaction.member.id;

    interaction
      .reply({
        embeds: [
          embed(`**Music**
      Which level of boost do you want?
      `),
        ],
        ephemeral: true,
        components: [row],
      })
      .then(async (int) => {
        const collector = interaction.channel.createMessageComponentCollector({
          selFilter,
          time: 30000,
          max: 1,
        });
        collector.on("collect", async (i) => {

          if (i.isStringSelectMenu() && i.customId === "selectbass") {

            let level = i.values[0];

            const bands = new Array(3)
              .fill(null)
              .map((_, i) =>
                ({ band: i, gain: levels[level] })
              );

            player.setEQ(...bands);

            i.update({
              embeds: [embed(`**Music**
                Successfully set the bass boost to \`${level}\``)], components: []
            })

          }

        });
      });
  },
};
