<template>
  <div id="app">
    <footer>
      <div
        class="pt-1 px-1 items-center bg-gradient-to-br from-palette-purple to-palette-pink rounded-t-3xl dark:rounded-t-3xl select-none shadow-2xl"
      >
        <div
          class="flex flex-col items-center p-1 rounded-t-3xl bg-palette-dark-gray"
        >
          <h1 class="text-base xl:text-xl text-gray-400">
            <a href="https://discord.gg/AhB5fqdDae" class="links">Discord</a> |
            <a href="/tos" class="links">Terms & Conditions</a> |
            <a href="https://twitter.com/acuitydev" class="links">Twitter</a>
          </h1>
          <h1 class="text-base xl:text-l text-white mt-2">
            Made with love by
            <a href="https://twitter.com/CodinqDev" class="links font-semibold">
              Codinq
            </a>
          </h1>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {}
</script>

<style lang="postcss" scoped>
.links {
  @apply transition duration-300 ease-in-out hover:text-gray-400 text-white;
}
</style>
