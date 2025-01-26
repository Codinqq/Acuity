<template>
  <div class="cardBorder">
    <div class="card">
      <h1 class="cardTitles">Utility - Commands</h1>
      <table class="tables">
        <ul>
          <li class="commandSet">
            <div class="commandName">AFK</div>
            <div class="commandInfo">
              Set yourself as afk, so others may know you're not there
            </div>
          </li>
          <li class="commandSet">
            <div class="commandName">Ascii</div>
            <div class="commandInfo">
              Make text bigger, like those ascii arts
            </div>
          </li>
          <li class="commandSet">
            <div class="commandName">Echo</div>
            <div class="commandInfo">
              Make Acuity say a message in the current channel
            </div>
          </li>
          <li class="commandSet">
            <div class="commandName">Giveaway</div>
            <div class="commandInfo">Create an giveaway for users to join</div>
          </li>
          <li class="commandSet">
            <div class="commandName">PinMessage</div>
            <div class="commandInfo">
              Pin a specified message in the current channel
            </div>
          </li>
          <li class="commandSet">
            <div class="commandName">Polls</div>
            <div class="commandInfo">
              Make a poll so people may vote on certain things
            </div>
          </li>
          <li class="commandSet">
            <div class="commandName">URLShorten</div>
            <div class="commandInfo">Shorten an url</div>
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
