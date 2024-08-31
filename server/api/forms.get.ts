import { z } from 'zod'
import { FormFullSchema, PageSchema, PageSizeSchema, dbObjectIdSchema } from '~~/shared/types'

const QuerySchema = z.intersection(
  z.object({
    pageSize: z.string().pipe(z.coerce.number()).pipe(PageSizeSchema),
  }),
  z.union([
    z.object({ cursor: dbObjectIdSchema }),
    z.object({ page: z.string().pipe(z.coerce.number()).pipe(PageSchema) }),
  ]),
)

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, QuerySchema.parse)
  await checkRequest({
    event,
    isAdminApi: true,
  })

  const forms = await db.form.findMany({
    // @ts-expect-error TS 不支持
    skip: Reflect.has(query, 'cursor') ? 1 : (query.page! - 1) * query.pageSize,
    cursor: Reflect.has(query, 'cursor') ? {
      // @ts-expect-error TS 不支持
      id: query.cursor,
    } : undefined,
    take: query.pageSize,
  })
  return forms.map(item => FormFullSchema.parse(item))
})
