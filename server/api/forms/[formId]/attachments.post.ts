import type { Buffer } from 'node:buffer'
import { ErrorMessages } from '~~/shared/errors'
import { TicketAttachmentTypeSchema } from '~~/shared/types'
import type { TicketAttachmentType } from '~~/shared/types'
import { FORM_ATTACHMENT_MAX_SIZE } from '~~/shared/consts'
import { getLarkTenantAccessToken } from '~~/server/utils/lark'

function create400Error() {
  return createError({
    status: 400,
    message: ErrorMessages.BAD_REQUEST,
  })
}

export default defineEventHandler(async (event) => {
  const body = await readMultipartFormData(event)
  if (!body)
    throw create400Error()
  await checkRequest({
    event,
    requireLogin: true,
  })

  let type: TicketAttachmentType | undefined
  let file: { data: Buffer, name: string, type: string } | undefined
  for (const field of body) {
    switch (field.name) {
      case 'type': {
        const parsed = TicketAttachmentTypeSchema.safeParse(field.data.toString())
        if (!parsed.success)
          throw create400Error()
        type = parsed.data
        break
      }

      case 'file':
        if (field.data.length > FORM_ATTACHMENT_MAX_SIZE) {
          throw createError({
            status: 413,
            message: ErrorMessages.ATTACHMENT_TOO_LARGE,
          })
        }
        file = {
          data: field.data,
          name: field.filename ?? 'file',
          type: field.type ?? 'application/octet-stream',
        }
        break

      default:
        throw create400Error()
    }
  }

  if (!type || !file)
    throw create400Error()

  const form = new FormData()
  form.append('name', file.name)
  form.append('type', type)
  form.append('content', new Blob([file.data]), file.type)

  const res = await (await fetch('https://www.feishu.cn/approval/openapi/v2/file/upload', {
    method: 'POST',
    body: form,
    headers: {
      Authorization: `Bearer ${await getLarkTenantAccessToken()}`,
    },
  })).json()
  return res
})
