<template>
  <div class="cardBorder">
    <div class="card">
      <h1 class="cardTitles">Guild - Commands</h1>
      <table class="tables">
        <ul class="rounded-3xl">
          <li class="commandSet">
            <div class="commandName">Applications</div>
            <div class="commandInfo">Create, edit or remove applications</div>
          </li>
          <li class="commandSet">
            <div class="commandName">Apply</div>
            <div class="commandInfo">Apply for a rank in the current guild</div>
          </li>
          <li class="commandSet">
            <div class="commandName">Bot</div>
            <div class="commandInfo">Get information about Acuity</div>
          </li>
          <li class="commandSet">
            <div class="commandName">Guild</div>
            <div class="commandInfo">Get information about the guild</div>
          </li>
          <li class="commandSet">
            <div class="commandName">Help</div>
            <div class="commandInfo">Get a list over the commands</div>
          </li>
          <li class="commandSet">
            <div class="commandName">Leaderboard</div>
            <div class="commandInfo">Get the guild level-leaderboard</div>
          </li>
          <li class="commandSet">
            <div class="commandName">Profile</div>
            <div class="commandInfo">Get information about a user</div>
          </li>
          <li class="commandSet">
            <div class="commandName">Tickets</div>
            <div class="commandInfo">Open, and close tickets</div>
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
  @apply font-light px-5 py-2 flex-grow content-center text-center w-1/2 my-auto;
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
