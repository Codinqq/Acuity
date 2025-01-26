<template>
  <div
    class="min-h-screen flex flex-col bg-gray-700 bg-cover min-w-screen select-none"
  >
    <Navbar />
    <div class="flex-grow">
      <mainCard />
      <features />
    </div>
    <Footer />
  </div>
</template>

<script>
import mainCard from '~/components/HomePage/MainCard.vue'
import features from '~/components/HomePage/Features.vue'

export default {
  components: {mainCard, features},
  head() {
    return {
      title: 'Acuity - Home Page',
      meta: [
        {
          hid: 'og:title',
          name: 'og:title',
          content: 'The official website for Acuity.',
        },
        {
          hid: 'og:image',
          name: 'og:image',
          content:
            'https://cdn.glitch.com/bc3529d6-efb9-4e88-9e31-2ee07ae97af2%2Fimage.ico?v=1628599605942',
        },
        {
          hid: 'og:description',
          name: 'og:description',
          content:
            'The official website for Acuity. An advanced Discord bot, which has alot of features!',
        },
        {
          hid: 'og:url',
          name: 'og:url',
          content: 'https://acuity.codinq.xyz/',
        },
      ],
    }
  },
}
</script>
