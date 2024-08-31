import { App, Bot } from 'fanbook-api-node-sdk'

const clientId = useRuntimeConfig().public.fanbookAppClientId
const clientSecret = useRuntimeConfig().fanbookAppClientSecret
const redirectUrl = useRuntimeConfig().public.fanbookOauth2RedirectUrl

export const fanbookApp = new App(
  clientId,
  clientSecret,
  redirectUrl,
)

const botToken = useRuntimeConfig().fanbookBotToken

export const fanbookBot = new Bot(botToken)
