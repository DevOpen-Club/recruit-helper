<script lang="ts" setup>
import { json } from '@codemirror/lang-json'
import { ElMessage } from 'element-plus'

withDefaults(defineProps<{
  title?: string
  confirmButtonLoading?: boolean
  confirmButtonText?: string
  cancelButtonText?: string
}>(), {
  title: '编辑 JSON',
  confirmButtonLoading: false,
  confirmButtonText: '确认修改',
  cancelButtonText: '取消',
})
const emit = defineEmits<{
  confirm: [value: any]
  cancel: []
}>()
const visible = defineModel<boolean>('visible')
const content = defineModel<string>('content', { required: true })

const codemirrorExtensions = [json()]

const editingContent = ref(content.value)
async function handleConfirm() {
  try {
    emit('confirm', JSON.parse(editingContent.value))
  }
  catch (e) {
    if (e instanceof SyntaxError) {
      ElMessage.error('输入不是合法的 JSON')
    }
    else {
      console.error(e)
      ElMessage.error('未知错误')
    }
  }
}
</script>

<template>
  <ElDialog
    :title
    :model-value="visible"
    align-center
    destroy-on-close
  >
    <NuxtCodeMirror
      v-model="editingContent"
      basic-setup
      editable
      height="70vh"
      :extensions="codemirrorExtensions"
    />
    <template #footer>
      <ElButton
        type="primary"
        :loading="confirmButtonLoading"
        @click="handleConfirm"
      >
        {{ confirmButtonText }}
      </ElButton>
      <ElButton @click="$emit('cancel')">
        {{ cancelButtonText }}
      </ElButton>
    </template>
  </ElDialog>
</template>
