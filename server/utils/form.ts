import type { Prisma } from '@prisma/client'
import { ErrorMessages } from '~~/shared/errors'
import type { PermissionItemType } from '~~/shared/types'

/** 获取指定表单，不存在则抛出错误 */
export async function getForm(
  id: string,
  options?: Omit<Prisma.Args<typeof db.form, 'findFirst'>, 'where'>,
) {
  const ret = await db.form.findFirst({
    where: { id },
    ...options,
  })
  if (!ret) {
    throw createError({
      status: 404,
      message: ErrorMessages.FORM_NOT_FOUND,
    })
  }
  return ret
}

/** 计算用户在指定表单的权限 */
export async function calcUserFormPermission(
  formId: string,
  userId: string,
): Promise<PermissionItemType> {
  const { basePermission } = await getForm(formId, {
    select: { basePermission: true },
  }) ?? {}
  const item = await db.permissionItem.findFirst({
    select: { type: true },
    where: {
      formId,
      userId,
    },
  })
  return item?.type ?? basePermission
}

/** 检查用户是否可以继续提交指定表单 */
export async function checkUserTicketCount(formId: string, userId: string) {
  const tickets = await db.ticket.count({
    where: {
      formId,
      authorId: userId,
    },
  })

  const { maxTicketPerUser } = await db.form.findFirst({
    select: {
      maxTicketPerUser: true,
    },
    where: {
      id: formId,
    },
  }) ?? {}

  if (maxTicketPerUser == null)
    return true
  return maxTicketPerUser > tickets
}
