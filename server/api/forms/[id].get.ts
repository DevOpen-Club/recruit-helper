import z from 'zod'
import { ErrorMessages } from '~~/shared/errors'
import { FormFullSchema, FormSchema, PermissionItemType, dbObjectIdSchema } from '~~/shared/types'
import type { Form, FormFull } from '~~/shared/types'

const ParamsSchema = z.object({
  id: dbObjectIdSchema,
})

export default defineEventHandler<Promise<{
  form: Form | FormFull
  permission: PermissionItemType
  reachedMaxTicket: boolean
}>>(async (event) => {
  const { id } = await getValidatedRouterParams(event, ParamsSchema.parse)
  const { user, isPrivileged } = await checkRequest({
    event,
    requireLogin: true,
  })

  if (!isPrivilegedUser) {
    if (await calcUserFormPermission(id, user.id) < PermissionItemType.VIEW) {
      throw createError({
        status: 403,
        message: ErrorMessages.PERMISSION_DENIED,
      })
    }
  }

  const form = await getForm(id)
  return {
    form: isPrivileged ? FormFullSchema.parse(form) : FormSchema.parse(form),
    permission: isPrivileged
      ? PermissionItemType.SUBMIT
      : await calcUserFormPermission(id, user.id),
    reachedMaxTicket: !(await checkUserTicketCount(id, user.id)),
  }
})
