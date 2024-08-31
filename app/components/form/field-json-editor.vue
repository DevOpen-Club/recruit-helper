<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import type { FormFull } from '~~/shared/types'

const props = defineProps<{
  id: string
  title: string
  field: keyof FormFull
  form: FormFull
}>()
const emit = defineEmits<{
  submitted: [data: any]
  close: []
}>()
const visible = defineModel<boolean>('visible')

const { $api } = useNuxtApp()

const editingContent = ref(
  JSON.stringify(props.form[props.field], null, 2),
)
const submitting = ref(false)
async function handleConfirm(data: any) {
  try {
    submitting.value = true
    await $api(`/api/forms/${props.id}`, {
      method: 'PATCH',
      body: {
        [props.field]: data,
      },
    })
    ElMessage.success('修改成功')
    visible.value = false
    emit('submitted', data)
    emit('close')
  }
  catch (e) {
    console.error(e)
    ElMessage.error('未知错误')
  }
  submitting.value = false
}

function handleCancel() {
  visible.value = false
  emit('close')
}
</script>

<template>
  <FormObjectEditor
    v-model:content="editingContent"
    v-model:visible="visible"
    :title
    :confirm-button-loading="submitting"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  />
</template>
