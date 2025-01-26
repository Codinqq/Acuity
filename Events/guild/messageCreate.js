let { getUser, getAdmin } = require("../../Utils/Database");
let { embed } = require("../../Utils/Embeds");
const { stripIndents } = require("common-tags");
const { PermissionFlagsBits } = require("discord.js");
module.exports = async (Acuity, message) => {
  let adminSettings = await getAdmin();
  if (adminSettings.isInMaintenance) return;

  if (message.author.bot) return;
  if (message.channel.type === "DM") return;

  let user = await getUser(message.author.id);

  if (user.settings.afk.enabled) {
    user.settings.afk.enabled = false;
    message.channel.send({
      embeds: [
        embed(`**AFK**
        ${message.author.tag} is no longer afk.`),
      ],
    });
    user.save().catch((err) => console.log(err));
  }

  if (
    message.content === `<@!740233365579497504>` ||
    message.content.startsWith(`<@!740233365579497504>`)
  ) {
    if (
      message.guild.members.me.permissions.has(
        PermissionFlagsBits.SendMessages
      ) ||
      message.channel
        .permissionsFor(message.guild.me)
        .toArray()
        .includes(PermissionFlagsBits.SendMessages)
    )
      message.delete();
    if (
      !message.channel
        .permissionsFor(message.guild.members.me)
        .toArray()
        .includes(PermissionFlagsBits.EmbedLinks) &&
      message.content.startsWith("<@!740233365579497504>")
    ) {
      message.channel.send(stripIndents`**Acuity**
                    Prefix - **/**
                    Website - https://acuity.codinq.xyz/ | Twitter - https://twitter.com/acuitydev | Support Server - https://discord.gg/ehMs7q7
                    
                    **You have embedded links disabled for Acuity, please enable embedded links in the settings, so Acuity can work properly!**`);
    } else {
      message.channel.send({
        embeds: [
          embed(`**Acuity**
                    Prefix - **/**
                    [Website](https://acuity.codinq.xyz/) | [Twitter](https://twitter.com/acuitydev) | [Support Server](https://discord.gg/ehMs7q7)`),
        ],
      });
    }
  }

  let allowedServers = [
    "733135938347073576",
    "527862771014959134",
    "439866052684283905",
    "374071874222686211",
    "414429834689773578",
    "716445624517656727",
    "450594207787384832",
    "331039920107814943",
    "264445053596991498",
    "446425626988249089",
    "110373943822540800",
    "387812458661937152",
    "720303803160592401",
    "608711879858192479",
    "635878203902394399",
  ];

  let permissions = [
    PermissionFlagsBits.KickMembers,
    PermissionFlagsBits.BanMembers,
    PermissionFlagsBits.ManageChannels,
    PermissionFlagsBits.ManageGuild,
    PermissionFlagsBits.AddReactions,
    PermissionFlagsBits.ViewAuditLog,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.EmbedLinks,
    PermissionFlagsBits.ManageMessages,
    PermissionFlagsBits.UseExternalEmojis,
    PermissionFlagsBits.ChangeNickname,
    PermissionFlagsBits.MentionEveryone,
    PermissionFlagsBits.ManageNicknames,
    PermissionFlagsBits.ManageRoles,
    PermissionFlagsBits.ManageWebhooks,
  ];

  let noPerms = [];

  for (var i in permissions) {
    if (!message.guild.members.me.permissions.has(permissions[i])) {
      noPerms.push(permissions[i]);
    }
  }

  if (
    noPerms.length > 0 &&
    !allowedServers.includes(message.guild.id) &&
    message.content.startsWith("<@!740233365579497504>")
  ) {
    return message.channel.send(stripIndents`**Error**
                Acuity doesn't have the required permissions to work.
                Please enable the permissions down below, before trying again.
                
                Missing permissions - **${noPerms.join(", ")}**`);
  }

  //Modules
  let autoModArray = ["antiSwear", "antiCaps", "antiLink", "antiSpam"];
  autoModArray.forEach((x) =>
    require(`./Modules/Auto-Mod/${x}`).run(Acuity, message)
  );
  require("./Modules/Levels/addXP.js").run(Acuity, message);
};
