<template>
  <div class="cards bg-gradient-to-br text-center">
    <div class="rounded-3xl bg-palette-dark-gray">
      <form class="flex md:flex-col flex-row p-4 text-center mx-auto">
        <div class="flex md:flex-row flex-col flex-grow ">
          <div class="flex flex-auto md:flex-col flex-row content-center mx-auto flex-grow">
            <div class="flex flex-col">
              <div
                class="flex flex-none p-1 bg-gradient-to-br from-palette-purple to-palette-pink rounded-full mx-auto"
              >
                <img
                  src="https://cdn.glitch.com/bc3529d6-efb9-4e88-9e31-2ee07ae97af2%2Fimage.png?v=1628585829768"
                  class="logo mx-auto"
                />
              </div>
              <div
              class="font-autobahn text-xl xl:text-5xl pt-5 font-semibold text-white flex-auto mx-auto"
            >
              Acuity
            </div>
            <div
              class="text-base w-full flex-none xl:text-2xl font-light text-white antialiased pt-4 mx-auto"
            >
              Your <b class="font-bold">Free</b> Discord Utility Bot
            </div>
            </div>
          </div>
          <div class="flex md:flex-grow content-left flex-auto">
          <div class="flex flex-col py-8 flex-auto mx-auto">
            <div class="flex flex-row md:mx-auto">
              <button
                class="buttons text-xl bg-gradient-to-tr from-palette-purple to-palette-pink text-xl hover:drop-shadow-2xl transition duration-500 ease-in-out"
                type="button"
                onclick="window.location.href='https://acuity.codinq.xyz/invite'"
              >
                Invite
              </button>
              <button
                class="buttons bg-gradient-to-tl from-palette-purple to-palette-pink text-xl hover:drop-shadow-2xl transition duration-500 ease-in-out"
                type="button"
                onclick="window.location.href='https://acuity.codinq.xyz/discord'"
              >
                Support
              </button>
            </div>
            <div class="mt-5">
              <h1 class="stats">
              Currently serving
              </h1>
              <h1 class="stats">
                <strong>{{ stats.servers }} servers</strong> &
                <strong>{{ stats.users }} users</strong>
              </h1>
              <h1 class="stats mt-5">
                Version <strong>{{ stats.version }}</strong>
              </h1>
            </div>
          </div>
        </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      stats: {},
    }
  },
  async asyncData() {
    const stats = await axios({
      method: 'get',
      url: 'https://codinqapi.glitch.me/acuity',
      responseType: 'text/event-stream',
      mode: 'cors',
      credentials: 'include',
    })
      .catch((err) => console.log(err))
      .then((stats) => {
        return { stats: stats }
      })
  },
  mounted() {
    axios({
      method: 'get',
      url: 'https://codinqapi.glitch.me/acuity',
      responseType: 'json',
    })
      .then(async (res) => {
        this.stats = res.data
      })
      .catch((err) => {
        return console.log(err.stack)
      })
  },
}
</script>

<style lang="postcss" scoped>
.cards {
  @apply my-10 from-palette-purple to-palette-pink mx-5 rounded-3xl shadow-2xl p-1;
}

.buttons {
  @apply transition duration-500 ease-in-out hover:shadow-lg text-white md:mt-8 md:px-6 md:py-4 rounded-lg font-normal tracking-wide outline-none focus:outline-none md:h-16 md:w-48 md:m-10 h-12 w-28 mx-5 mx-auto;
}

.stats {
  @apply text-base w-full flex-none xl:text-2xl font-light text-white antialiased;
}

.logo {
  @apply w-32 h-32 sm:w-32 sm:h-32 md:h-40 md:w-40 lg:h-44 lg:w-44 xl:w-48 xl:h-48 mx-auto;
}
</style>
