import { z } from 'zod'

export const ConfigSchema = z.object({
  fanbookAppClientSecret: z.string(),
  fanbookBotToken: z.string(),
  larkAppSecret: z.string(),
  superKey: z.string().regex(/^[0-9a-f]{64}$/i, {
    message: 'Super Key 必须是长度为 64 的十六进制字符串',
  }).toLowerCase(),
  public: z.object({
    fanbookAppClientId: z.string(),
    fanbookGuildId: z.string(),
    fanbookOauth2RedirectUrl: z.string(),
    host: z.string(),
    larkAppId: z.string(),
  }),
})
