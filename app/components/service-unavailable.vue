<script lang="ts" setup>
import { CircleSlash } from 'lucide-vue-next'
import type { SystemStatus } from '~~/shared/types'

defineProps<{
  status: SystemStatus
}>()
</script>

<template>
  <ElResult title="系统已关闭" sub-title="服务不可用">
    <template #icon>
      <CircleSlash color="#636c76" />
    </template>
  </ElResult>
</template>
