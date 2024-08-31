import { UserType } from '~~/shared/types'

export default defineTask({
  meta: {
    description: '每日更新统计数据，返回是否已更新',
  },
  async run() {
    const stat = await db.statistic.findFirst()
    if (!stat)
      throw new Error('统计数据未初始化')

    const today = new Date().getUTCDate()
    if (today === stat.lastUpdateTime.getUTCDate())
      return { result: false }

    await db.statistic.update({
      where: { id: stat.id },
      data: {
        newUserCount1d: 0,
        newTicketCount1d: 0,
      },
    })

    await db.statistic.update({
      where: { id: stat.id },
      data: {
        userCount: await db.user.count({
          where: {
            type: { not: UserType.SYSTEM },
          },
        }),
      },
    })

    await db.statistic.update({
      where: { id: stat.id },
      data: {
        ticketCount: await db.ticket.count(),
      },
    })

    return { result: true }
  },
})
