import { SystemStatusInfoSchema } from '~~/shared/types'

export default defineEventHandler(async (event) => {
  await checkRequest({
    event,
    bypassSystemStatusCheck: true,
  })
  return SystemStatusInfoSchema.parse(await getMeta())
})
