import { SystemStatusInfoSchema } from '~~/shared/types'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, SystemStatusInfoSchema.parse)
  await checkRequest({
    event,
    isAdminApi: true,
  })
  return await updateMeta(body)
})
