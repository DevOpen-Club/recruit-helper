import { UserType } from '~~/shared/types'

let cache: Ref<boolean> | undefined

export default () => {
  if (cache)
    return cache

  cache = ref(false)
  watchImmediate(useCurrentUser(), (user) => {
    if (!user)
      cache!.value = false
    else
      cache!.value = user.type === UserType.SYSTEM || user.type === UserType.ADMIN
  })
  return cache
}
