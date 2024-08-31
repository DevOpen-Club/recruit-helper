import { z } from 'zod'
import { ErrorMessages } from '~~/shared/errors'
import { UserFullSchema, UserType } from '~~/shared/types'

const BodySchema = z.object({
  key: z.string(),
})

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event) ?? '0.0.0.0'
  const { key } = await readValidatedBody(event, BodySchema.parse)
  await checkRequest({
    event,
    requireLogin: false,
    bypassSystemStatusCheck: true,
  })

  if (key !== useRuntimeConfig().superKey) {
    throw createError({
      status: 403,
      message: ErrorMessages.WRONG_SUPER_KEY,
    })
  }

  const user = await db.user.findFirst({
    where: {
      type: UserType.SYSTEM,
    },
  })
  if (!user)
    throw createError(ErrorMessages.BAD_CONFIGURE)

  return UserFullSchema.parse(await userLogin(user, ip))
})
