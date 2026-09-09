// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://cagelike-flukily-niels.ngrok-free.dev/api',
      appEnv: process.env.NUXT_PUBLIC_APP_ENV || 'development',
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'Rejuve Gamification',
      appVersion: process.env.NUXT_PUBLIC_APP_VERSION || '1.0.0',
      apiTimeout: Number(process.env.NUXT_PUBLIC_API_TIMEOUT) || 30000
    }
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt'
  ],

  css: [
    '~/assets/css/main.css',
    'sweetalert2/dist/sweetalert2.min.css'
  ],

  app: {
    head: {
      title: 'Gamification Mission Management System',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Enterprise Mission Management & Performance Gamification System' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap' }
      ]
    }
  },

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.js',
    exposeConfig: false,
    viewer: false
  },

  typescript: {
    shim: false,
    strict: false,
    typeCheck: false
  }
})
