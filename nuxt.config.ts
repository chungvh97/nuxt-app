// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  app: {
    head: {
      title: 'Product Manager',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }
      ]
    }
  },
  modules: ['nuxt-quasar-ui'],
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
