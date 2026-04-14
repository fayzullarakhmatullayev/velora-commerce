// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: { enabled: true },

  // Nuxt 4 app directory
  future: {
    compatibilityVersion: 4,
  },

  // Components: disable path prefix so ui/VSkeleton.vue → <VSkeleton>, not <UiVSkeleton>
  components: [{ path: '~/components', pathPrefix: false }],

  routeRules: {
    '/admin/**': {
      ssr: false,
    },
  },

  // Core modules
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@nuxtjs/supabase',
    '@vueuse/nuxt',
    '@nuxt/eslint',
  ],

  // i18n configuration
  i18n: {
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'uz', name: "O'zbek", file: 'uz.json' },
      { code: 'ru', name: 'Русский', file: 'ru.json' },
    ],
    defaultLocale: 'en',
    langDir: '../i18n/locales/',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'velora_locale',
      redirectOn: 'root',
    },
  },

  // Supabase configuration
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_ANON_KEY,
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/confirm',
      exclude: [
        '/',
        '/shop',
        '/shop/*',
        '/product/*',
        '/about',
        '/contact',
        '/auth/register',
        '/auth/forgot-password',
        '/auth/confirm',
        '/privacy',
        '/terms',
      ],
    },
    // Keep the session cookie alive for 30 days (matches Supabase refresh token TTL)
    cookieOptions: {
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
  },

  // Pinia
  pinia: {
    storesDirs: ['./app/stores/**'],
  },

  // Runtime config (publicly exposed)
  runtimeConfig: {
    // Private keys (server-only)
    // Note: supabase.secretKey is managed by @nuxtjs/supabase via NUXT_SUPABASE_SECRET_KEY
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,

    // Public keys (exposed to client)
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      appUrl: process.env.APP_URL || 'http://localhost:3000',
      appName: 'Velora Commerce',
    },
  },

  // Global CSS
  css: ['~/assets/css/main.css'],

  // TypeScript
  typescript: {
    strict: true,
    typeCheck: false, // Enable after initial setup for better DX
  },

  // Vite optimizations
  vite: {
    optimizeDeps: {
      include: ['@vue/devtools-core', '@vue/devtools-kit'],
    },
  },

  // App head
  app: {
    head: {
      title: 'Velora Commerce — Shop Beautifully. Scale Effortlessly.',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Velora Commerce — premium multilingual e-commerce platform.',
        },
        { name: 'theme-color', content: '#0f0f0f' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
        },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },
})
