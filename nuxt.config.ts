// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  nitro: {
    preset: 'vercel' // phải có preset hoặc adapter phù hợp
  },
  app: {
    head: {
      title: 'Quỹ team',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }
      ]
    }
  },
  modules: ['nuxt-quasar-ui', '@pinia/nuxt'],
  quasar: {
    plugins: [
      'Notify',
      'Dialog',
      'Loading',
      'LoadingBar',
      'BottomSheet',
      'Dark',
      'Screen'
    ],
    config: {
      dark: false // tùy chọn: bật chế độ dark mặc định nếu muốn
    }
  }
})
