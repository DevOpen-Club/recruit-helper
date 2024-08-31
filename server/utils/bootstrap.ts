import type { Prisma } from '@prisma/client'
import { createConsola } from 'consola'
import { SystemStatus, UserStatus, UserType } from '~~/shared/types'

export const DEFAULT_STATISTICS: Prisma.Args<typeof db.statistic, 'create'>['data'] = {
  userCount: 0,
  newUserCount1d: 0,
  ticketCount: 0,
  newTicketCount1d: 0,
}

export const DEFAULT_META: Prisma.Args<typeof db.meta, 'create'>['data'] = {
  status: SystemStatus.NORMAL,
  openSignup: false,
}

export const SYSTEM_USER: Prisma.Args<typeof db.user, 'create'>['data'] = {
  name: 'root',
  type: UserType.SYSTEM,
  status: UserStatus.NORMAL,
  session: generateSession(),
  sessionExpireTime: new Date(0), // 使初始 session 无效，需要时会重新生成
  signupIp: '0.0.0.0',
}

export async function bootstrap() {
  const logger = createConsola().withTag('bootstrap')
  logger.start('正在进行初始化')

  try {
    if (!await db.meta.findFirst()) {
      await db.meta.create({ data: DEFAULT_META })
      logger.success('初始化元数据成功')
    }
    else {
      logger.info('跳过元数据初始化')
    }

    if (!await db.statistic.findFirst()) {
      await db.statistic.create({ data: DEFAULT_STATISTICS })
      logger.success('初始化统计数据成功')
    }
    else {
      logger.info('跳过统计数据初始化')
    }

    if (!await db.user.count({ where: { type: UserType.SYSTEM } })) {
      await db.user.create({ data: SYSTEM_USER })
      logger.success('初始化系统用户成功')
    }
    else {
      logger.info('跳过系统用户初始化')
    }
  }
  catch (err) {
    logger.fail('初始化失败')
    logger.error(err)
    return false
  }
  logger.ready('初始化完成')
  return true
}
