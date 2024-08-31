import { z } from 'zod'
import { db } from '~~/server/utils/db'
import { dbObjectIdSchema } from '~~/shared/types'

const ParamsSchema = z.object({
  id: dbObjectIdSchema,
})

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, ParamsSchema.parse)
  await checkRequest({
    event,
    isAdminApi: true,
  })
  await getForm(id, { select: { id: true } })
  await db.form.delete({
    where: { id },
  })
})
