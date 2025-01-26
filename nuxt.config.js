export default {
  head: {
    title: 'Acuity',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: 'https://cdn.glitch.com/bc3529d6-efb9-4e88-9e31-2ee07ae97af2%2Fimage.ico?v=1628599605942',
      },
    ],
  },

  css: ['./Assets/Fonts/fonts.css'],

  plugins: [],

  components: true,

  buildModules: ['@nuxtjs/tailwindcss'],

  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
    '@nuxt/content',
    '@nuxtjs/redirect-module',
  ],

  axios: {
    baseURL: '/',
  },

  pwa: {
    manifest: {
      lang: 'en',
    },
  },
  content: {},

  build: {},

  redirect: [
    { from: '^/discord', to: 'https://discord.gg/AhB5fqdDae', statusCode: 301 },
    { from: '^/twitter', to: 'https://twitter.com/AcuityDev', statusCode: 301 },
    { from: '^/codinq', to: 'https://twitter.com/CodinqDev', statusCode: 301 },
  ],
  target: 'static',
  ssr: false
}
