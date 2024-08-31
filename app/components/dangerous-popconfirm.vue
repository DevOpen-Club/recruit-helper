<script lang="ts" setup>
import { useTimeoutPoll } from '@vueuse/core'

const props = withDefaults(defineProps<{
  title: string
  wait?: number
  confirmText?: string
  cancelText?: string
}>(), {
  wait: 5000,
  confirmText: '确定',
  cancelText: '取消',
})

const wait = ref(0)
const { pause, resume } = useTimeoutPoll(async () => {
  wait.value -= 200
  if (!wait.value)
    pause()
}, 200)

function handleShow() {
  wait.value = props.wait
  resume()
}
function handleHide() {
  wait.value = props.wait
  pause()
}
</script>

<template>
  <ElPopconfirm
    :title
    @show="handleShow"
    @hide="handleHide"
  >
    <template #reference>
      <slot />
    </template>
    <template #actions="{ confirm, cancel }">
      <ElButton type="danger" :disabled="wait" @click="confirm">
        {{ wait > 0 ? `${confirmText} ${Math.ceil(wait / 1000)}` : confirmText }}
      </ElButton>
      <ElButton @click="cancel">
        {{ cancelText }}
      </ElButton>
    </template>
  </ElPopconfirm>
</template>
