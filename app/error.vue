<script lang="ts" setup>
import { ShieldX } from 'lucide-vue-next'
import type { NuxtError } from '#app'

const props = defineProps<{
  error: Error
}>()

const is403Error = computed(() => {
  return isNuxtError(props.error) && props.error.statusCode === 403
})
</script>

<template>
  <ElResult v-if="is403Error" title="权限不足" :sub-title="error.message">
    <template #icon>
      <ShieldX />
    </template>
  </ElResult>

  <Error v-else :error />
</template>
