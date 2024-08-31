import { z } from 'zod'
import type { UserFull } from '~~/shared/types'
import { UserFullSchema } from '~~/shared/types'

const BodySchema = z.object({
  session: z.string(),
})

export default defineEventHandler<Promise<UserFull>>(async (event) => {
  const ip = getRequestIP(event) ?? '0.0.0.0'
  const { session } = await readValidatedBody(event, BodySchema.parse)
  await checkRequest({
    event,
    requireLogin: false,
    bypassSystemStatusCheck: true,
  })

  const user = await getUserBySession(session)
  checkUserStatus(user)
  await checkSystemStatus(isPrivilegedUser(user))
  return UserFullSchema.parse(await userLogin(user, ip))
})
