<script lang="ts" setup>
import { ElLoading } from 'element-plus'
import { FetchError } from 'ofetch'
import type { SuspensionInfo } from '~/components/user-suspened.vue'
import { ErrorMessages } from '~~/shared/errors'

type Status = 'loading' | 'success' | 'error'
const status = ref<Status>('loading')
const error = ref<string | undefined>()
const isUnknownError = ref(false)

const code = useRoute().query.code
const next = computed(() => {
  const { state } = useRoute().query
  if (!state || state === '/login' || state === 'null')
    return '/'
  return String(state)
})

const suspension = ref<SuspensionInfo | undefined>()

async function login() {
  try {
    useCurrentUser().value = await $fetch('/api/auth/fanbook', {
      method: 'POST',
      body: { code },
    })
    status.value = 'success'
    await nextTick()
    await nextTick()
    await navigateTo(next.value, { replace: true })
  }
  catch (e) {
    status.value = 'error'
    if (e instanceof FetchError && e.data.message) {
      isUnknownError.value = false
      if (e.data.message === ErrorMessages.USER_SUSPENDED) {
        suspension.value = e.data.data
      }
      else {
        error.value = e.data.message
      }
    }
    else {
      console.error(e)
      isUnknownError.value = true
      error.value = String(e)
    }
  }
}

if (useCurrentUser().value) {
  navigateTo(next.value, { replace: true })
}
else if (typeof code !== 'string') {
  status.value = 'error'
}
else {
  const { close } = ElLoading.service({ text: '正在登录' })
  login().finally(close)
}

const retry = () => navigateTo('/login', { replace: true })
</script>

<template>
  <ElResult
    v-if="status === 'success'"
    title="登录成功"
    icon="success"
  />
  <template v-else-if="status === 'error'">
    <UserSuspened v-if="suspension" v-bind="suspension" />
    <ElResult
      v-else-if="!isUnknownError"
      title="登录失败"
      :sub-title="error"
      icon="error"
    >
      <template #extra>
        <ElButton type="primary" @click="retry">
          重试
        </ElButton>
      </template>
    </ElResult>
    <Error v-else :error />
  </template>
</template>
