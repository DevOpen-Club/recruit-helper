import process from 'node:process'
import i18next from 'i18next'
import { z } from 'zod'
import { zodI18nMap } from 'zod-i18n-map'
import translation from 'zod-i18n-map/locales/zh-CN/zod.json'
import { ConfigSchema } from './shared/config'
import { FORM_ATTACHMENT_MAX_SIZE } from './shared/consts'
import { version } from './package.json'

i18next.init({
  lng: 'zh-CN',
  resources: {
    'zh-CN': { zod: translation },
  },
})
z.setErrorMap(zodI18nMap)

export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      meta: [{
        name: 'generator',
        content: `Fanbook Recruit Helper v${version}`,
      }],
      title: 'Fanbook Recruit Helper',
    },
  },

  compatibilityDate: '2024-04-03',

  devServer: {
    port: 8214,
  },

  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4,
  },

  modules: [
    '@vueuse/nuxt',
    'nuxt-codemirror',
    'nuxt-security',
  ],

  nitro: {
    experimental: {
      tasks: true,
    },
    scheduledTasks: {
      '0 0 * * *': ['refresh-statistic'],
    },
  },

  routeRules: {
    '/api': {
      security: {
        rateLimiter: {
          tokensPerInterval: 30,
          interval: 10 * 1000, // 10s
        },
        requestSizeLimiter: {
          maxUploadFileRequestInBytes: FORM_ATTACHMENT_MAX_SIZE,
        },
      },
    },
    '/api/auth/super-key': {
      security: {
        rateLimiter: {
          tokensPerInterval: 1,
          interval: 5000,
        },
      },
    },
  },

  runtimeConfig: ConfigSchema.parse({
    fanbookAppClientSecret: process.env.FBRH_FANBOOK_APP_CLIENT_SECRET,
    fanbookBotToken: process.env.FBRH_FANBOOK_BOT_TOKEN,
    larkAppSecret: process.env.FBRH_LARK_APP_SECRET,
    superKey: process.env.FBRH_SUPER_KEY,
    public: {
      fanbookAppClientId: process.env.FBRH_FANBOOK_APP_CLIENT_ID,
      fanbookGuildId: process.env.FBRH_FANBOOK_GUILD_ID,
      fanbookOauth2RedirectUrl: process.env.FBRH_FANBOOK_OAUTH2_REDIRECT_URL,
      host: process.env.FBRH_HOST,
      larkAppId: process.env.FBRH_LARK_APP_ID,
    },
  }),

  security: {
    headers: {
      contentSecurityPolicy: {
        // 允许 unsafe-eval 用于 vform
        'script-src': [
          '\'self\'',
          '\'unsafe-eval\'',
          'https:',
          '\'unsafe-inline\'',
          '\'strict-dynamic\'',
          '\'nonce-{{nonce}}\'',
        ],
      },
    },
  },

  ssr: false,
})
