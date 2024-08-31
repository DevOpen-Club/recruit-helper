import { ElButton, ElNotification } from 'element-plus'

/**
 * 登出当前用户，清除会话信息，刷新页面或重定向到指定路径。
 * @param redirect 重定向路径，不填则刷新页面
 */
export async function logout(redirect?: string) {
  useCookie('session').value = undefined
  await nextTick()
  if (!redirect)
    location.reload()
  else
    location.replace(redirect)
}

const SESSION_EXPIRE_SCHEDULE = 60 * 1000 // 1min
let scheduledExpiration = false

/** 通知并引导用户重新登录，用户确认后 resolve */
function notifySessionExpiration() {
  return new Promise<void>((resolve) => {
    const { close } = ElNotification.warning({
      title: '会话已过期',
      message: (
        h('div', {
          style: { 'display': 'flex', 'flex-direction': 'column' },
        }, [
          '如果还有未完成的操作，请先保存，重新登录后再提交。',
          h(ElButton, {
            style: { 'margin-top': '4px' },
            type: 'primary',
            onClick: () => {
              close()
              resolve()
            },
          }, '重新登录'),
        ])
      ),
      duration: 0,
      showClose: false,
    })
  })
}

export function checkSessionExpiration() {
  const user = useCurrentUser().value
  if (!user || scheduledExpiration)
    return
  const rest = new Date(user.sessionExpireTime).getTime() - Date.now()
  if (rest <= 0) {
    scheduledExpiration = true
    setTimeout(async () => {
      await notifySessionExpiration()
      const next = location.pathname + location.search + location.hash
      await logout(`/login?next=${encodeURI(next)}`)
    }, rest - 1000)
  }
}
useIntervalFn(checkSessionExpiration, SESSION_EXPIRE_SCHEDULE)
