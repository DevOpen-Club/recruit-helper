<script lang="ts" setup>
import { Ban } from 'lucide-vue-next'
import dayjs from 'dayjs'

export interface SuspensionInfo {
  reason: string | null
  endTime: string | null
}

const props = defineProps<SuspensionInfo>()

const title = computed(() => {
  return props.endTime
    ? `你的账号被管理员封禁至 ${dayjs(props.endTime).format('YYYY-MM-DD HH:mm:ss')}`
    : '你的账号被管理员封禁'
})
</script>

<template>
  <ElResult :title>
    <template #icon>
      <Ban />
    </template>
    <template #extra>
      <p v-if="reason">
        原因：{{ reason }}
      </p>
    </template>
  </ElResult>
</template>
