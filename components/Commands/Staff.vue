<template>
  <div class="cardBorder">
    <div class="card">
      <h1 class="cardTitles">Staff - Commands</h1>
      <table class="tables">
        <ul>
          <li class="commandSet">
            <div class="commandName">Addrole</div>
            <div class="commandInfo">Add a role to a user</div>
          </li>
          <li class="commandSet">
            <div class="commandName">Announce</div>
            <div class="commandInfo">Announce something to the guild</div>
          </li>
          <li class="commandSet">
            <div class="commandName">Ban</div>
            <div class="commandInfo">Ban a user from the guild</div>
          </li>
          <li class="commandSet">
            <div class="commandName">Clear</div>
            <div class="commandInfo">
              Clear an amount of messages from the chat
            </div>
          </li>
          <li class="commandSet">
            <div class="commandName">Dashboard</div>
            <div class="commandInfo">Configure Acuity to your liking</div>
          </li>
          <li class="commandSet">
            <div class="commandName">Kick</div>
            <div class="commandInfo">Kick a user from the guild</div>
          </li>
          <li class="commandSet">
            <div class="commandName">Lockdown</div>
            <div class="commandInfo">Lock the server</div>
          </li>
          <li class="commandSet">
            <div class="commandName">Mute</div>
            <div class="commandInfo">Mute a user, so they can't talk</div>
          </li>
          <li class="commandSet">
            <div class="commandName">Nick</div>
            <div class="commandInfo">
              Rename yourself, or if you have permission, others
            </div>
          </li>
          <li class="commandSet">
            <div class="commandName">Notifications</div>
            <div class="commandInfo">Add Twitch or YouTube notifications.</div>
          </li>
          <li class="commandSet">
            <div class="commandName">ReactionRoles</div>
            <div class="commandInfo">Setup reaction roles for the guild!</div>
          </li>
          <li class="commandSet">
            <div class="commandName">RemoveRole</div>
            <div class="commandInfo">Remove a role from a user!</div>
          </li>
          <li class="commandSet">
            <div class="commandName">Softban</div>
            <div class="commandInfo">
              Ban the user to delete messages, and then unban them
            </div>
          </li>
          <li class="commandSet">
            <div class="commandName">Tempban</div>
            <div class="commandInfo">Temporarily ban a user from the guild</div>
          </li>
          <li class="commandSet">
            <div class="commandName">Tempmute</div>
            <div class="commandInfo">
              Temporarily mute a user from the guild
            </div>
          </li>
          <li class="commandSet">
            <div class="commandName">Unban</div>
            <div class="commandInfo">Unban a user for the guild</div>
          </li>
        </ul>
      </table>
    </div>
  </div>
</template>

<script>
export default {}
</script>

<style lang="postcss" scoped>
.commandTitle {
  @apply text-lg rounded-l-3xl px-5 py-2 flex-grow content-center text-center tracking-widest;
}

.commandInfo {
  @apply font-light px-5 py-2 flex-grow content-center text-center w-1/2;
}

.commandName {
  @apply font-light px-5 py-2 flex-grow content-center text-center w-1/2  my-auto;
}

.commandSet {
  @apply transition duration-500 ease-in-out hover:bg-palette-light-dark-gray rounded-full flex flex-grow;
}

.card {
  @apply rounded-3xl bg-palette-dark-gray p-5;
}

.cardBorder {
  @apply my-5 mb-5 bg-gradient-to-tr from-palette-purple to-palette-pink p-1 mx-5 rounded-3xl text-left text-white shadow-2xl flex flex-col;
}

.cardTitles {
  @apply text-2xl font-light p-2 flex-grow text-center text-left px-5 py-2 font-autobahn;
}

.tables {
  @apply table-fixed w-full text-sm lg:text-xl overflow-clip;
}
</style>
