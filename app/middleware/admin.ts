import { UserType } from '~~/shared/types'

export default defineNuxtRouteMiddleware(() => {
  const { type } = useCurrentUser().value ?? {}
  if (type !== UserType.ADMIN && type !== UserType.SYSTEM) {
    return abortNavigation(createError({
      status: 403,
      message: '访问此页面需要管理员权限',
    }))
  }
})
