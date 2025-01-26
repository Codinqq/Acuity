<template>
  <div class="font-sans antialiased" id="app">
    <nav
      class="justify-between flex-wrap bg-gradient-to-br from-palette-purple to-palette-pink xl:px-1 xl:pb-1 rounded-b-3xl shadow-2xl"
    >
      <div
        class="flex flex-row items-center p-1 rounded-b-3xl bg-palette-dark-gray"
      >
        <div
          class="flex flex-grow xl:content-center md:content-center xl:flex-nos-shrink text-white mx-auto px-10 md:mr-6 md:m-0"
        >
          <a href="/"
            ><h1 class="font-extrabold text-transparent font-autobahn text-3xl bg-clip-text bg-gradient-to-tl from-palette-purple to-palette-pink">Acuity</h1></a>
        </div>
        <form
          class="flex flex-shrink justify-content p-2 content-center object-right"
        >
          <div class="flex items-center md:flex-wrap text-base md:text-xl">
            <div>
              <button
                class="buttons"
                onclick="location.href='/commands'"
                type="button"
              >
                Commands
              </button>
            </div>
          </div>
        </form>
      </div>
    </nav>
  </div>
</template>

<script>
export default {}
</script>

<style lang="postcss" scoped>
.buttons {
  @apply transition duration-300 ease-in-out mb-2 xl:mb-0 text-white px-5 py-3 rounded-lg hover:bg-palette-neutral hover:bg-opacity-10 hover:shadow-xl xl:mr-2 ;
}
</style>
