import type { User } from '@prisma/client'
import z from 'zod'
import { getLarkBotOpenId } from '~~/server/utils/lark'
import { ErrorMessages } from '~~/shared/errors'
import { PermissionItemType, dbObjectIdSchema } from '~~/shared/types'

const ParamsSchema = z.object({
  formId: dbObjectIdSchema,
})

const BodySchema = z.object({
  form: z.object({}).passthrough(),
})

async function checkPermissionOrThrow(
  formId: string,
  userId: string,
) {
  const permission = await calcUserFormPermission(formId, userId)
  if (permission < PermissionItemType.SUBMIT) {
    throw createError({
      status: 403,
      message: ErrorMessages.PERMISSION_DENIED,
    })
  }

  if (!await checkUserTicketCount(formId, userId)) {
    throw createError({
      status: 403,
      message: ErrorMessages.REACHED_MAX_TICKET_COUNT,
    })
  }
}

function transformMetadata(field: string, user: User) {
  switch (field) {
    case '@UserId':
      return user.id
    case '@UserName':
      return user.name
    case '@UserFanbookId':
      return user.fanbookId
    case '@UserFanbookShortId':
      return user.fanbookShortId
  }
  return field
}

/**
 * 把 vform 表单字段值转化为飞书审批表单字段值。
 * @param type 飞书审批表单字段类型
 * @param data vform 表单字段值
 */
function transformData(type: string, data: any) {
  switch (type) {
    case 'number':
      return String(data)
  }
  return data
}

export default defineEventHandler(async (event) => {
  const { formId } = await getValidatedRouterParams(event, ParamsSchema.parse)
  const { form } = await readValidatedBody(event, BodySchema.parse)
  const { user, isPrivileged } = await checkRequest({
    event,
    requireLogin: true,
  })

  const {
    larkApprovalDefination,
    larkApprovalWidgets,
  } = await getForm(formId, {
    select: {
      larkApprovalDefination: true,
      larkApprovalWidgets: true,
    },
  }) ?? {}
  if (!larkApprovalDefination || !larkApprovalWidgets)
    throw createError(ErrorMessages.BAD_CONFIGURE)

  if (isPrivileged)
    await checkPermissionOrThrow(formId, user.id)

  const approvalForm: any[] = []
  for (const [key, { type, field }] of Object.entries(larkApprovalWidgets)) {
    approvalForm.push({
      id: key,
      type,
      value: transformData(
        type,
        field[0] === '@'
          ? transformMetadata(field, user)
          : form[field],
      ),
    })
  }

  const larkApprovalId = (await lark.approval.instance.create({
    data: {
      approval_code: larkApprovalDefination,
      form: JSON.stringify(approvalForm),
      open_id: await getLarkBotOpenId(),
    },
  })).data?.instance_code
  if (!larkApprovalId) {
    console.error('飞书审批单据创建失败')
    throw createError({
      status: 500,
      message: ErrorMessages.UPSTREAM_LARK_ERROR,
    })
  }

  updateStatistic({
    ticketCount: { increment: 1 },
    newTicketCount1d: { increment: 1 },
  })
  return db.ticket.create({
    data: {
      formId,
      data: form,
      authorId: user.id,
      larkApprovalId,
    },
  })
})
