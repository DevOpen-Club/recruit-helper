import { Client } from '@larksuiteoapi/node-sdk'
import { createConsola } from 'consola'

const appId = useRuntimeConfig().public.larkAppId
const appSecret = useRuntimeConfig().larkAppSecret

export const lark = new Client({
  appId,
  appSecret,
  logger: createConsola().withTag('lark'),
})

let cachedTenantAccessToken: { token: string, expireTime: number } | undefined
/** 获取飞书应用 tenant access token，结果会缓存。 */
export async function getLarkTenantAccessToken() {
  // 在 token 过期前 10 分钟请求新 token
  if (cachedTenantAccessToken
    && (cachedTenantAccessToken.expireTime - 10 * 60 * 1000) > Date.now()) {
    return cachedTenantAccessToken.token
  }

  const data: any = await lark.auth.tenantAccessToken.internal({
    data: {
      app_id: appId,
      app_secret: appSecret,
    },
  })
  if (data.code)
    throw new Error(`获取飞书应用 tenant access token 失败：${data.code}`)

  cachedTenantAccessToken = {
    token: data.tenant_access_token,
    expireTime: Date.now() + data.expire * 1000,
  }
  return cachedTenantAccessToken.token
}

let cachedBotOpenId: string | undefined
/** 获取飞书机器人自身的 open id */
export async function getLarkBotOpenId() {
  if (cachedBotOpenId)
    return cachedBotOpenId
  cachedBotOpenId = (await lark.request({
    url: '/open-apis/bot/v3/info',
  })).bot.open_id
  return cachedBotOpenId
}
