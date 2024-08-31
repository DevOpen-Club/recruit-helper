import { z } from 'zod'
import { FanbookApiError } from 'fanbook-api-node-sdk'
import { createUser } from '~~/server/utils/user'
import { ErrorMessages } from '~~/shared/errors'
import { UserFullSchema } from '~~/shared/types'
import type { UserFull } from '~~/shared/types'

const BodySchema = z.object({
  code: z.string(),
})

export default defineEventHandler<Promise<UserFull>>(async (event) => {
  const ip = getRequestIP(event) ?? '0.0.0.0'
  const { code } = await readValidatedBody(event, BodySchema.parse)
  await checkRequest({
    event,
    requireLogin: false,
    bypassSystemStatusCheck: true,
  })

  try {
    const fanbookSession = await fanbookApp.codeToToken(code)

    const GUILD_ID = useRuntimeConfig().public.fanbookGuildId
    const guilds = await fanbookApp.listUserGuild(fanbookSession.access_token)
    if (!guilds.some(guild => guild.guild_id === GUILD_ID)) {
      throw createError({
        status: 403,
        message: ErrorMessages.NOT_IN_FANBOOK_GUILD,
      })
    }

    const fanbookUser = await fanbookApp.getUser(fanbookSession.access_token)
    const user = await db.user.findFirst({
      where: {
        fanbookId: fanbookUser.user_id.toString(),
      },
    })

    if (user) { // 用户已存在，如果系统状态为 CLOSED，仅管理员可登录
      await checkSystemStatus(isPrivilegedUser(user))
    }
    else { // 用户不存在，如果系统状态为 CLOSED，禁止注册，否则根据配置决定是否自动注册
      await checkSystemStatus(false)
      if ((await getMeta()).openSignup) {
        return UserFullSchema.parse(await createUser({
          name: fanbookUser.nickname,
          fanbookId: fanbookUser.user_id.toString(),
          fanbookShortId: Number(fanbookUser.username),
          signupIp: ip,
        }))
      }
      else {
        throw createError({
          status: 403,
          message: ErrorMessages.AUTO_SIGNUP_DISABLED,
        })
      }
    }

    return UserFullSchema.parse(await userLogin(user, ip, fanbookUser.nickname))
  }
  catch (e) {
    if (e instanceof FanbookApiError) {
      // 过滤最常见的错误信息，避免日志过长
      if (e.response?.data !== 'InternalServerError: grant: none')
        console.error(e.error)
      throw createError({
        status: 400,
        message: ErrorMessages.OAUTH2_CODE_EXPIRED,
      })
    }
    throw e
  }
})
