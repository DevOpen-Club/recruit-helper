import crypto from 'node:crypto'
import type { H3Event } from 'h3'
import type { Prisma, User } from '@prisma/client'
import { ErrorMessages } from '~~/shared/errors'
import { UserStatus, UserType } from '~~/shared/types'

const SESSION_REGEX = /^[0-9a-f]{16}$/
const SESSION_EXPIRE_TIME = 7 * 24 * 60 * 60 * 1000 // 7d
const SYSTEM_SESSION_EXPIRE_TIME = 10 * 60 * 1000 // 10min

export function generateSession() {
  return crypto.randomBytes(8).toString('hex')
}

export function checkUserStatus(user: User) {
  const { status, suspensionEndTime } = user
  if (status === UserStatus.SUSPENDED
    && (suspensionEndTime === null || suspensionEndTime >= new Date())) {
    throw createError({
      status: 403,
      message: ErrorMessages.USER_SUSPENDED,
      data: {
        reason: user.suspensionReason,
        endTime: user.suspensionEndTime,
      },
    })
  }
}

/** 检查用户是否是特权用户 */
export function isPrivilegedUser(user: User) {
  return user.type === UserType.SYSTEM || user.type === UserType.ADMIN
}

export async function getUserBySession(session: string) {
  if (!SESSION_REGEX.test(session)) {
    throw createError({
      status: 400,
      message: ErrorMessages.BAD_SESSION,
    })
  }

  const user = await db.user.findFirst({
    where: { session },
  })
  if (!user || user.sessionExpireTime < new Date()) {
    throw createError({
      status: 401,
      message: ErrorMessages.SESSION_EXPIRED,
    })
  }

  return user
}

export async function getCurrentUser(event: H3Event) {
  const session = getRequestHeader(event, 'authorization')
  if (!session)
    return undefined

  const user = await getUserBySession(session)
  checkUserStatus(user)
  return user
}

type CreateUserPayload = Omit<
  Prisma.Args<typeof db.user, 'create'>['data'],
  'type' | 'status' | 'session' | 'sessionExpireTime'
>

export async function createUser(payload: CreateUserPayload) {
  updateStatistic({
    userCount: { increment: 1 },
    newUserCount1d: { increment: 1 },
  })
  return db.user.create({
    data: {
      type: UserType.USER,
      status: UserStatus.NORMAL,
      session: generateSession(),
      sessionExpireTime: new Date(Date.now() + SESSION_EXPIRE_TIME),
      ...payload,
    },
  })
}

/**
 * 更新用户登录记录，如有昵称修改则更新昵称
 * @returns 更新后的用户信息
 */
export async function userLogin(user: User, ip: string, name?: string) {
  checkUserStatus(user)

  // 状态是被封禁，但通过了 checkUserStatus，说明封禁时间已过
  if (user.status === UserStatus.SUSPENDED) {
    // 同步封禁状态相关的其他字段
    await db.user.update({
      where: { id: user.id },
      data: {
        status: UserStatus.NORMAL,
        suspensionReason: null,
        suspensionEndTime: null,
      },
    })
  }

  if (user.sessionExpireTime < new Date()) {
    const sessionExpireTime = user.type === UserType.SYSTEM
      ? new Date(Date.now() + SYSTEM_SESSION_EXPIRE_TIME)
      : new Date(Date.now() + SESSION_EXPIRE_TIME)
    await db.user.update({
      where: { id: user.id },
      data: {
        session: generateSession(),
        sessionExpireTime,
      },
    })
  }

  return db.user.update({
    where: { id: user.id },
    data: {
      lastLoginTime: new Date(),
      lastLoginIp: ip,
      name,
    },
  })
}
