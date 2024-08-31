import type { UserFull } from '~~/shared/types'

export default () => useState<UserFull | undefined>('user')
