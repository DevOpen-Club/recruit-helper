import type { Prisma, User } from '@prisma/client'
import type { H3Event } from 'h3'
import { ErrorMessages } from '~~/shared/errors'
import { SystemStatus } from '~~/shared/types'

let shouldInvalidMetaCache = false
export const getMeta = defineCachedFunction(async () => {
  const ret = await db.meta.findFirst()
  if (!ret)
    throw createError(ErrorMessages.BAD_CONFIGURE)
  shouldInvalidMetaCache = false
  return ret
}, {
  shouldInvalidateCache: () => shouldInvalidMetaCache,
})

export async function updateMeta(data: Prisma.Args<typeof db.meta, 'update'>['data']) {
  const { id } = await getMeta()
  shouldInvalidMetaCache = true
  return await db.meta.update({
    where: { id },
    data,
  })
}

export async function updateStatistic(data: Prisma.Args<typeof db.statistic, 'update'>['data']) {
  const record = await db.statistic.findFirst()
  if (!record)
    throw createError(ErrorMessages.BAD_CONFIGURE)
  await db.statistic.update({
    where: { id: record.id },
    data,
  })
}

/**
 * 检查系统状态，如果不允许访问则抛出异常
 * @param allowWhenClose 是否允许系统状态为 CLOSED
 */
export async function checkSystemStatus(allowWhenClose: boolean) {
  const meta = await getMeta()
  if (meta.status === SystemStatus.CLOSED && !allowWhenClose) {
    throw createError({
      status: 503,
      message: ErrorMessages.SYSTEM_CLOSED,
    })
  }
}

interface CheckRequestOptions<T1 extends boolean, T2 extends boolean> {
  event: H3Event
  /**
   * 是否跳过系统状态检查。
   * @default false
   */
  bypassSystemStatusCheck?: boolean
  /** @default false */
  requireLogin?: T1
  /**
   * 是否管理员 API。
   *
   * 启用此选项会跳过系统状态检查，并要求用户登录。
   * @default false
   */
  isAdminApi?: T2
}

export interface CheckRequestResult<T1 extends boolean, T2 extends boolean> {
  user: T1 extends true
    ? User
    : User | undefined
  isPrivileged: T2 extends true
    ? true
    : boolean
}

/**
 * 检查请求，有错误则抛出异常。
 *
 * 请务必在所有请求处理函数的开头调用此函数。
 */
export async function checkRequest<T1 extends boolean, T2 extends boolean>(options: CheckRequestOptions<T1, T2>) {
  const ret = {
    user: undefined,
    isPrivileged: false,
  } as CheckRequestResult<T1, T2>

  // 检查系统状态
  await checkSystemStatus(!!(options.isAdminApi || options.bypassSystemStatusCheck));

  // 检查登录情况
  (ret.user as User | undefined) = await getCurrentUser(options.event)
  if ((options.requireLogin || options.isAdminApi) && !ret.user) {
    if (!ret.user) {
      throw createError({
        status: 401,
        message: ErrorMessages.UNAUTHORIZED,
      })
    }
  }

  // 检查权限
  if (ret.user)
    (ret.isPrivileged as boolean) = isPrivilegedUser(ret.user)
  if (options.isAdminApi && !ret.isPrivileged) {
    throw createError({
      status: 403,
      message: ErrorMessages.PERMISSION_DENIED,
    })
  }

  return ret
}
