let { getGuild, getAdmin } = require("../../Utils/Database");
let { embed } = require("../../Utils/Embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = async (Acuity, oldGuild, newGuild) => {
  let adminSettings = await getAdmin();
  if (adminSettings.isInMaintenance) return;

  let guild = await getGuild(newGuild.id);
  if (!guild) return;

  let logChannel = newGuild.channels.cache.find(
    (c) => c.id === guild.settings.channels.botLogs
  );

  if (!logChannel) return;

  if (
    guild.addons.advancedLogs.guildUpdate === false ||
    !guild.addons.advancedLogs.guildUpdate
  ) {
    return;
  } else {
    if (newGuild.members.me.permissions.has(PermissionFlagsBits.ViewAuditLog)) {

      if (oldGuild.afkChannelID != newGuild.afkChannelID) {
        if (
          newGuild.members.me
            .permissionsIn(logChannel)
            .has(PermissionFlagsBits.SendMessages)
        )
          logChannel.send({
            embeds: [
              embed(`**Log - AFK-Channel changed**       
                        New AFK-Channel - **${
                          newGuild.channels.cache.find(
                            (c) => c.id === newGuild.afkChannelID
                          )
                            ? newGuild.channels.cache.find(
                                (c) => c.id === newGuild.afkChannelID
                              ).name
                            : "None"
                        }**
                        Old AFK-Channel - **${
                          oldGuild.channels.cache.find(
                            (c) => c.id === oldGuild.afkChannelID
                          )
                            ? oldGuild.channels.cache.find(
                                (c) => c.id === oldGuild.afkChannelID
                              ).name
                            : "None"
                        }**`),
            ],
          });
      }

      if (oldGuild.name != newGuild.name) {
        if (newGuild.members.me.permissionsIn(logChannel).has(PermissionFlagsBits.SendMessages))
          logChannel.send({
            embeds: [
              embed(`**Log - Guild-Name changed**                                    
                        New Guild-Name - **${newGuild.name}**
                        Old Guild-Name - **${oldGuild.name}**`),
            ],
          });
      }

      if (oldGuild.ownerID != newGuild.ownerID) {
        if (newGuild.members.me.permissionsIn(logChannel).has(PermissionFlagsBits.SendMessages))
          logChannel.send({
            embeds: [
              embed(`**Log - Owner changed**               
                    New Owner - **${newGuild.members.cache.find(
                      (c) => c.id === newGuild.ownerID
                    )}**
                    Old Owner - **${oldGuild.members.cache.find(
                      (c) => c.id === oldGuild.ownerID
                    )}**`),
            ],
          });
      }

      if (oldGuild.partnered != newGuild.partnered) {
        if (newGuild.members.me.permissionsIn(logChannel).has(PermissionFlagsBits.SendMessages))
          logChannel.send({
            embeds: [
              embed(`**Log - Partner**               
                    This guild is now **${
                      newGuild.partnered ? "Partnered" : "No longer partnered"
                    }**!`),
            ],
          });
      }

      if (oldGuild.verified != newGuild.verified) {
        if (newGuild.members.me.permissionsIn(logChannel).has(PermissionFlagsBits.SendMessages))
          logChannel.send({
            embeds: [
              embed(`**Log - Verified**               
                    This guild is now **${
                      newGuild.verified ? "Verified" : "No longer verified"
                    }**!`),
            ],
          });
      }

      if (oldGuild.verificationLevel != newGuild.verificationLevel) {
        if (newGuild.verificationLevel === "NONE") {
          newGuild.verificationLevel = "None - Unrestricted";
        } else if (newGuild.verificationLevel === "LOW") {
          newGuild.verificationLevel = "LOW - Verified Email";
        } else if (newGuild.verificationLevel === "MEDIUM") {
          newGuild.verificationLevel =
            "Medium - Registered on Discord for 5 minutes.";
        } else if (newGuild.verificationLevel === "HIGH") {
          newGuild.verificationLevel = "High - Server-Member for 10 minutes";
        } else if (newGuild.verificationLevel === "VERY-HIGH") {
          newGuild.verificationLevel = "Highest - Verified phone";
        }

        if (oldGuild.verificationLevel === "NONE") {
          oldGuild.verificationLevel = "None - Unrestricted";
        } else if (oldGuild.verificationLevel === "LOW") {
          oldGuild.verificationLevel = "LOW - Verified Email";
        } else if (oldGuild.verificationLevel === "MEDIUM") {
          oldGuild.verificationLevel =
            "Medium - Registered on Discord for 5 minutes.";
        } else if (oldGuild.verificationLevel === "HIGH") {
          oldGuild.verificationLevel = "High - Server-Member for 10 minutes";
        } else if (oldGuild.verificationLevel === "VERY-HIGH") {
          oldGuild.verificationLevel = "Highest - Verified phone";
        }

        if (oldGuild.verificationLevel !== newGuild.verificationLevel) {
          if (
            newGuild.members.me.permissionsIn(logChannel).has(PermissionFlagsBits.SendMessages)
          )
            logChannel.send({
              embeds: [
                embed(`**Log - Verification-Level changed**               
                            New Verification-Level - **${newGuild.verificationLevel}**
                            Old Verification-Level - **${oldGuild.verificationLevel}**`),
              ],
            });
        }
      }

      if (oldGuild.vanityURLCode != newGuild.vanityURLCode) {
        if (newGuild.members.me.permissionsIn(logChannel).has(PermissionFlagsBits.SendMessages))
          logChannel.send({
            embeds: [
              embed(`**Log - Vanity-URL changed**
                        New URL - **${newGuild.vanityURLCode}**
                        Old URL - **${oldGuild.vanityURLCode}**`),
            ],
          });
      }

      if (oldGuild.premiumTier != newGuild.premiumTier) {
        let noPrem = "Not boosted";
        let prem1 = "Tier 1";
        let prem2 = "Tier 2";
        let prem3 = "Tier 3";

        if (newGuild.premiumTier === 0) {
          newGuild.premiumTier = noPrem;
        } else if (newGuild.premiumTier === 1) {
          newGuild.premiumTier = prem1;
        } else if (newGuild.premiumTier === 2) {
          newGuild.premiumTier = prem2;
        } else if (newGuild.premiumTier === 3) {
          newGuild.premiumTier = prem3;
        }

        if (newGuild.members.me.permissionsIn(logChannel).has(PermissionFlagsBits.SendMessages))
          logChannel.send({
            embeds: [
              embed(`**Log - Server Boost**               
                    This guild is now **${newGuild.premiumTier}**`),
            ],
          });
      }

      if (oldGuild.region != newGuild.region) {
        if (newGuild.region === "brazil") {
          newGuild.region = "Brazil";
        } else if (newGuild.region === "europe") {
          newGuild.region = "Europe";
        } else if (newGuild.region === "hongkong") {
          newGuild.region = "Hong Kong";
        } else if (newGuild.region === "india") {
          newGuild.region = "India";
        } else if (newGuild.region === "japan") {
          newGuild.region = "Japan";
        } else if (newGuild.region === "russia") {
          newGuild.region = "Russia";
        } else if (newGuild.region === "singapore") {
          newGuild.region = "Singapore";
        } else if (newGuild.region === "southafrica") {
          newGuild.region = "South-Africa";
        } else if (newGuild.region === "sydney") {
          newGuild.region = "Sydney";
        } else if (newGuild.region === "us-central") {
          newGuild.region = "US-Central";
        } else if (newGuild.region === "us-east") {
          newGuild.region = "US-East";
        } else if (newGuild.region === "us-south") {
          newGuild.region = "US-South";
        } else if (newGuild.region === "us-west") {
          newGuild.region = "US-West";
        }

        if (oldGuild.region === "brazil") {
          oldGuild.region = "Brazil";
        } else if (oldGuild.region === "europe") {
          oldGuild.region = "Europe";
        } else if (oldGuild.region === "hongkong") {
          oldGuild.region = "Hong Kong";
        } else if (oldGuild.region === "india") {
          oldGuild.region = "India";
        } else if (oldGuild.region === "japan") {
          oldGuild.region = "Japan";
        } else if (oldGuild.region === "russia") {
          oldGuild.region = "Russia";
        } else if (oldGuild.region === "singapore") {
          oldGuild.region = "Singapore";
        } else if (oldGuild.region === "southafrica") {
          oldGuild.region = "South-Africa";
        } else if (oldGuild.region === "sydney") {
          oldGuild.region = "Sydney";
        } else if (oldGuild.region === "us-central") {
          oldGuild.region = "US-Central";
        } else if (oldGuild.region === "us-east") {
          oldGuild.region = "US-East";
        } else if (oldGuild.region === "us-south") {
          oldGuild.region = "US-South";
        } else if (oldGuild.region === "us-west") {
          oldGuild.region = "US-West";
        }
        if (newGuild.members.me.permissionsIn(logChannel).has(PermissionFlagsBits.SendMessages))
          logChannel.send({
            embeds: [
              embed(`**Log - Region changed**                                            
                        New Region - **${newGuild.region}**
                        Old Region - **${oldGuild.region}**`),
            ],
          });
      }
    } else {
      if (oldGuild.afkChannelID != newGuild.afkChannelID) {
        if (newGuild.members.me.permissionsIn(logChannel).has(PermissionFlagsBits.SendMessages))
          logChannel.send({
            embeds: [
              embed(`**Log - AFK-Channel changed**
                    New AFK-Channel - **${
                      newGuild.channels.cache.find(
                        (c) => c.id === newGuild.afkChannelID
                      )
                        ? newGuild.channels.cache.find(
                            (c) => c.id === newGuild.afkChannelID
                          ).name
                        : "None"
                    }**
                    Old AFK-Channel - **${
                      oldGuild.channels.cache.find(
                        (c) => c.id === oldGuild.afkChannelID
                      )
                        ? oldGuild.channels.cache.find(
                            (c) => c.id === oldGuild.afkChannelID
                          ).name
                        : "None"
                    }**`),
            ],
          });
      }

      if (oldGuild.name != newGuild.name) {
        if (newGuild.members.me.permissionsIn(logChannel).has(PermissionFlagsBits.SendMessages))
          logChannel.send({
            embeds: [
              embed(`**Log - Guild-Name changed**               
                    New Guild-Name - **${newGuild.name}**
                    Old Guild-Name - **${oldGuild.name}**`),
            ],
          });
      }

      if (oldGuild.ownerID != newGuild.ownerID) {
        if (newGuild.members.me.permissionsIn(logChannel).has(PermissionFlagsBits.SendMessages))
          logChannel.send({
            embeds: [
              embed(`**Log - Owner changed**               
                New Owner - **${newGuild.members.cache.find(
                  (c) => c.id === newGuild.ownerID
                )}**
                Old Owner - **${oldGuild.members.cache.find(
                  (c) => c.id === oldGuild.ownerID
                )}**`),
            ],
          });
      }

      if (oldGuild.partnered != newGuild.partnered) {
        if (newGuild.members.me.permissionsIn(logChannel).has(PermissionFlagsBits.SendMessages))
          logChannel.send({
            embeds: [
              embed(`**Log - Partner**               
                This guild is now **${
                  newGuild.partnered ? "Partnered" : "No longer partnered"
                }**!`),
            ],
          });
      }

      if (oldGuild.verified != newGuild.verified) {
        if (newGuild.members.me.permissionsIn(logChannel).has(PermissionFlagsBits.SendMessages))
          logChannel.send({
            embeds: [
              embed(`**Log - Verified**               
                This guild is now **${
                  newGuild.verified ? "Verified" : "No longer verified"
                }**!`),
            ],
          });
      }

      if (oldGuild.verificationLevel != newGuild.verificationLevel) {
        if (newGuild.verificationLevel === "NONE") {
          newGuild.verificationLevel = "None - Unrestricted";
        } else if (newGuild.verificationLevel === "LOW") {
          newGuild.verificationLevel = "LOW - Verified Email";
        } else if (newGuild.verificationLevel === "MEDIUM") {
          newGuild.verificationLevel =
            "Medium - Registered on Discord for 5 minutes.";
        } else if (newGuild.verificationLevel === "HIGH") {
          newGuild.verificationLevel = "High - Server-Member for 10 minutes";
        } else if (newGuild.verificationLevel === "VERY-HIGH") {
          newGuild.verificationLevel = "Highest - Verified phone";
        }

        if (oldGuild.verificationLevel === "NONE") {
          oldGuild.verificationLevel = "None - Unrestricted";
        } else if (oldGuild.verificationLevel === "LOW") {
          oldGuild.verificationLevel = "LOW - Verified Email";
        } else if (oldGuild.verificationLevel === "MEDIUM") {
          oldGuild.verificationLevel =
            "Medium - Registered on Discord for 5 minutes.";
        } else if (oldGuild.verificationLevel === "HIGH") {
          oldGuild.verificationLevel = "High - Server-Member for 10 minutes";
        } else if (oldGuild.verificationLevel === "VERY-HIGH") {
          oldGuild.verificationLevel = "Highest - Verified phone";
        }

        if (oldGuild.verificationLevel !== newGuild.verificationLevel) {
          if (
            newGuild.members.me.permissionsIn(logChannel).has(PermissionFlagsBits.SendMessages)
          )
            logChannel.send({
              embeds: [
                embed(`**Log - Verification-Level changed**
                        New Verification-Level - **${newGuild.verificationLevel}**
                        Old Verification-Level - **${oldGuild.verificationLevel}**`),
              ],
            });
        }
      }

      if (oldGuild.vanityURLCode != newGuild.vanityURLCode) {
        if (newGuild.members.me.permissionsIn(logChannel).has(PermissionFlagsBits.SendMessages))
          logChannel.send({
            embeds: [
              embed(`**Log - Vanity-URL changed**               
                    New URL - **${newGuild.vanityURLCode}**
                    Old URL - **${oldGuild.vanityURLCode}**`),
            ],
          });
      }

      if (oldGuild.premiumTier != newGuild.premiumTier) {
        let noPrem = "Not boosted";
        let prem1 = "Tier 1";
        let prem2 = "Tier 2";
        let prem3 = "Tier 3";

        if (newGuild.premiumTier === 0) {
          newGuild.premiumTier = noPrem;
        } else if (newGuild.premiumTier === 1) {
          newGuild.premiumTier = prem1;
        } else if (newGuild.premiumTier === 2) {
          newGuild.premiumTier = prem2;
        } else if (newGuild.premiumTier === 3) {
          newGuild.premiumTier = prem3;
        }

        if (newGuild.members.me.permissionsIn(logChannel).has(PermissionFlagsBits.SendMessages))
          logChannel.send({
            embeds: [
              embed(`**Log - Server Boost**               
                This guild is now **${newGuild.premiumTier}**`),
            ],
          });
      }

      if (oldGuild.region != newGuild.region) {
        if (newGuild.region === "brazil") {
          newGuild.region = "Brazil";
        } else if (newGuild.region === "europe") {
          newGuild.region = "Europe";
        } else if (newGuild.region === "hongkong") {
          newGuild.region = "Hong Kong";
        } else if (newGuild.region === "india") {
          newGuild.region = "India";
        } else if (newGuild.region === "japan") {
          newGuild.region = "Japan";
        } else if (newGuild.region === "russia") {
          newGuild.region = "Russia";
        } else if (newGuild.region === "singapore") {
          newGuild.region = "Singapore";
        } else if (newGuild.region === "southafrica") {
          newGuild.region = "South-Africa";
        } else if (newGuild.region === "sydney") {
          newGuild.region = "Sydney";
        } else if (newGuild.region === "us-central") {
          newGuild.region = "US-Central";
        } else if (newGuild.region === "us-east") {
          newGuild.region = "US-East";
        } else if (newGuild.region === "us-south") {
          newGuild.region = "US-South";
        } else if (newGuild.region === "us-west") {
          newGuild.region = "US-West";
        }

        if (oldGuild.region === "brazil") {
          oldGuild.region = "Brazil";
        } else if (oldGuild.region === "europe") {
          oldGuild.region = "Europe";
        } else if (oldGuild.region === "hongkong") {
          oldGuild.region = "Hong Kong";
        } else if (oldGuild.region === "india") {
          oldGuild.region = "India";
        } else if (oldGuild.region === "japan") {
          oldGuild.region = "Japan";
        } else if (oldGuild.region === "russia") {
          oldGuild.region = "Russia";
        } else if (oldGuild.region === "singapore") {
          oldGuild.region = "Singapore";
        } else if (oldGuild.region === "southafrica") {
          oldGuild.region = "South-Africa";
        } else if (oldGuild.region === "sydney") {
          oldGuild.region = "Sydney";
        } else if (oldGuild.region === "us-central") {
          oldGuild.region = "US-Central";
        } else if (oldGuild.region === "us-east") {
          oldGuild.region = "US-East";
        } else if (oldGuild.region === "us-south") {
          oldGuild.region = "US-South";
        } else if (oldGuild.region === "us-west") {
          oldGuild.region = "US-West";
        }
        if (newGuild.members.me.permissionsIn(logChannel).has(PermissionFlagsBits.SendMessages))
          logChannel.send({
            embeds: [
              embed(`**Log - Region changed**                                      
                    New Region - **${newGuild.region}**
                    Old Region - **${oldGuild.region}**`),
            ],
          });
      }
    }
  }
};
