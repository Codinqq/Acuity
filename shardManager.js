const { ShardingManager } = require("discord.js");
const { token, betaToken, inDevelopment } = require("./config.json");


// Just incase I need sharding again... lol


if (inDevelopment) {
  const manager = new ShardingManager("./Acuity.js", {
    token: betaToken,
  });

  manager.spawn();
    manager.on("shardCreate", (shard) =>
    console.log(`Acuity Development | Shard ${shard.id} is now ready.`)
    );

} else {

  const manager = new ShardingManager("./Acuity.js", {
    token: token,
  });

  manager.spawn();
    manager.on("shardCreate", (shard) =>
    console.log(`Acuity | Shard ${shard.id} is now ready.`)
    );

}


