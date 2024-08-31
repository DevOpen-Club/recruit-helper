import z from 'zod'
import { db } from '~~/server/utils/db'
import { FormFullSchema, dbObjectIdSchema } from '~~/shared/types'

const ParamsSchema = z.object({
  id: dbObjectIdSchema,
})

const BodySchema = FormFullSchema.omit({ id: true }).partial()

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, ParamsSchema.parse)
  const body = await readValidatedBody(event, BodySchema.parse)
  await checkRequest({
    event,
    isAdminApi: true,
  })

  await getForm(id, { select: { id: true } })
  await db.form.update({
    data: body,
    where: { id },
  })
})
