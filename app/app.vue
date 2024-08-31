<script lang="ts" setup>
// @ts-expect-error untyped
import locale from 'element-plus/dist/locale/zh-cn.mjs'
import 'dayjs/locale/zh-cn'
import { checkSessionExpiration } from '~/utils/user'
import { SystemStatus } from '~~/shared/types'
import useUserPrivileged from '~/composables/use-user-privileged'

watch(useCurrentUser(), (user) => {
  const { sessionExpireTime, session } = user ?? {}
  useCookie('session', {
    expires: sessionExpireTime ? new Date(sessionExpireTime) : undefined,
  }).value = session
})

const { $api } = useNuxtApp()
const status = ref<SystemStatus>(SystemStatus.NORMAL)
const availibility = ref(true)

function calcServiceAvailibility(status: SystemStatus, path: string) {
  switch (status) {
    case SystemStatus.NORMAL:
      return true
    case SystemStatus.CLOSED:
      return path.startsWith('/admin') || path.startsWith('/login')
  }
  return false
}

onBeforeMount(async () => {
  status.value = (await $api('/api/meta')).status
  watchImmediate(() => useRoute().path, (path) => {
    availibility.value = calcServiceAvailibility(status.value, path)
  })
})

const isAdminLayout = computed(() => {
  return useRoute().path.startsWith('/admin') && useUserPrivileged().value
})

checkSessionExpiration()
</script>

<template>
  <ElConfigProvider :locale>
    <AdminHeader v-if="isAdminLayout" />
    <ElContainer>
      <AdminAside v-if="isAdminLayout" />
      <ElMain>
        <NuxtPage v-if="availibility" />
        <ServiceUnavailable v-else :status />
      </ElMain>
    </ElContainer>
    <Footer />
  </ElConfigProvider>
</template>

<style>
* {
  margin: 0;
  padding: 0;
}

#__nuxt {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
