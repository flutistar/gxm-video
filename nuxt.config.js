module.exports = {
  mode: 'universal',
  telemetry: false,
  /*
   ** Headers of the page
   */
  head: {
    title: process.env.TITLE || 'PokerGO',
    meta: [
      {
        hid: 'description',
        name: 'description',
        content:
          'Stream the world’s largest collection of live poker tournaments and TV shows like the World Series of Poker (WSOP), Poker After Dark, High Stakes Poker, and more on PokerGO.'
      },
      {
        hid: 'og:description',
        name: 'og:description',
        content:
          'Stream the world’s largest collection of live poker tournaments and TV shows like the World Series of Poker (WSOP), Poker After Dark, High Stakes Poker, and more on PokerGO.'
      },
      { hid: 'title', name: 'title', content: 'PokerGO' },
      { hid: 'og:title', name: 'og:title', content: 'PokerGO' },
      {
        hid: 'image',
        name: 'image',
        content:
          (process.env.SITE_URL || 'https://app.pokergo.com') +
          '/logo_white.png'
      },
      {
        hid: 'url',
        name: 'url',
        content: process.env.SITE_URL || 'https://app.pokergo.com'
      },
      {
        hid: 'og:site_name',
        name: 'og:site_name',
        content: process.env.TITLE || 'PokerGO'
      },
      {
        hid: 'site_name',
        name: 'site_name',
        content: process.env.TITLE || 'PokerGO'
      },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        name: 'google-site-verification',
        content: '83seNIc0yB1_pTXXDaexhtoqHz3jD-IxjcnGV7KTc_U'
      }
    ],
    link: [
      {
        rel: 'stylesheet',
        href:
          'https://fonts.googleapis.com/css?family=Lato|Open+Sans&display=swap'
      },
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ],
    script: [
      {
        src: 'https://js.stripe.com/v3/'
      },
      {
        src: 'https://cdn.jwplayer.com/libraries/8FnajRft.js'
      }
      // {
      //   src:
      //     'https://www.paypal.com/sdk/js?client-id=sb&vault=true&disable-funding=credit,card'
      // }
    ]
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },
  /*
   ** Global CSS
   */
  css: ['video.js/dist/video-js.css', '@/assets/scss/app.scss'],
  styleResources: {
    scss: ['assets/scss/global/_colors.scss']
  },
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    { src: '~plugins/video-player.js', ssr: false },
    { src: '@/plugins/notification-server', mode: 'server' },
    { src: '@/plugins/notify' },
    { src: '@/plugins/notification-client', mode: 'client' },
    { src: '@/plugins/vue-touch', ssr: false, mode: 'client' },
    { src: '@/plugins/cookie-law', ssr: false }
  ],
  pageTransition: {
    name: 'fade',
    mode: 'out-in'
  },
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module',
    // Doc: https://github.com/nuxt-community/stylelint-module
    '@nuxtjs/stylelint-module',
    [
      '@nuxtjs/fontawesome',
      {
        suffix: true,
        icons: {
          // list the icons you want to add, not listed icons will be tree-shaked
          solid: [
            'faChevronCircleRight',
            'faChevronCircleLeft',
            'faTimes',
            'faStar'
          ]
        }
      }
    ]
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/auth',
    // Doc: https://github.com/nuxt-community/dotenv-module
    '@nuxtjs/dotenv',
    'nuxt-helmet',
    'nuxt-facebook-pixel-module',
    [
      '@nuxtjs/google-tag-manager',
      {
        id: process.env.GTM_ID || 'none',
        dev: process.env.STAGE === 'STAGING',
        layer: 'dataLayer',
        pageTracking: false,
        pageViewEventName: 'nuxtRoute',
        respectDoNotTrack: false
      }
    ]
  ],
  helmet: {
    hsts: true
  },
  facebook: {
    /* module options */
    track: 'PageView',
    pixelId: process.env.FBP_ID || 'none',
    disabled: process.env.STAGE === 'DEV' || process.env.STAGE === 'STAGING'
  },

  /* asd
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {
    baseURL: process.env.SITE_URL || 'http://localhost:3000',
    progress: false
  },
  env: {
    site_title: process.env.TITLE || 'PokerGO',
    stripe_key: process.env.STRIPE_PUBLIC_API_KEY || '',
    subscription_api: process.env.VUE_APP_WP_API || '',
    site_url: process.env.SITE_URL || 'https://app.pokergo.com',
    device_token: process.env.DEVICE_TOKEN || '',
    seo_url:
      process.env.SEO_REDIRECT_URL ||
      process.env.SITE_URL + '/schedule?login=show'
  },
  auth: {
    watchLogin: false,
    redirect: false,
    strategies: {
      local: {
        endpoints: {
          login: {
            url: '/api/login',
            method: 'post',
            propertyName: 'meta.token'
          },
          logout: { url: '/api/logout', method: 'post' },
          user: { url: '/api/user', method: 'get', propertyName: 'data' }
        }
      }
    },
    cookie: {
      prefix: 'auth.',
      options: {
        secure: process.env.NODE_ENV === 'PRODUCTION'
      }
    }
  },
  serverMiddleware: ['redirect-ssl'],
  router: {
    // extendRoutes(routes) {
    //   for (const key in routes) {
    //     routes[key].caseSensitive = true
    //   }
    // },
    middleware: ['auth', 'customauth']
  },
  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    devtools: true,
    extend(config, ctx) {}
  }
}
