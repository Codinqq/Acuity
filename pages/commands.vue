<template>
  <div
    class="min-h-screen flex flex-col bg-gray-700 bg-cover min-w-screen select-none"
  >
    <Navbar />
    <div class="flex flex-col my-5">
      <Guild/>
      <Staff/>
      <Stats/>
      <Utility/>
    </div>
    <Footer />
  </div>
</template>

<script>
import Stats from '~/components/Commands/Stats.vue';
import Guild from '~/components/Commands/Guild.vue';
import Staff from '~/components/Commands/Staff.vue';
import Utility from '~/components/Commands/Utility.vue';

export default {
  data() {
    return {
      title: "Acuity - Commands",
    };
  },
  components: {Stats, Guild, Staff, Utility},
  head() {
    return {
      title: this.title,
      meta: [
        {
          hid: "og:title",
          name: "og:title",
          content: "Acuity - Commands",
        },
        {
          hid: "og:image",
          name: "og:image",
          content:
            "https://cdn.glitch.com/bc3529d6-efb9-4e88-9e31-2ee07ae97af2%2Fimage.ico?v=1628599605942",
        },
        {
          hid: "og:description",
          name: "og:description",
          content: "The official commands page of Acuity!",
        },
        {
          hid: "og:url",
          name: "og:url",
          content: "https://acuity.codinq.xyz/commands",
        },
      ],
    };
  },
};
</script>