import { StatisticDataSchema } from '~~/shared/types'

export default defineEventHandler(async (event) => {
  await checkRequest({
    event,
    isAdminApi: true,
  })
  return StatisticDataSchema.parse(await db.statistic.findFirst())
})
