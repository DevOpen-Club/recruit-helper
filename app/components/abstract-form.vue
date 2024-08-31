<script lang="ts" setup>
import { FolderLock } from 'lucide-vue-next'
import type { Form } from '~~/shared/types'

export interface AbstractFormMethods {
  getFormData: () => any
  setFormData: (data: any) => void
  resetForm: () => void
}

const props = defineProps<{
  form: Form
  disabled: boolean
  submitting: boolean
}>()
const emit = defineEmits<{
  loaded: []
  submit: [data: any]
  reset: []
}>()

const formRef = ref<any>(null)
const loaded = ref(false)

watch(
  () => props.form.structure,
  v => formRef.value.setFormJson(v),
)

function refreshFormStatus() {
  if (props.disabled)
    formRef.value.disableForm()
  else
    formRef.value.enableForm()
}
watch(() => props.disabled, refreshFormStatus)
onMounted(() => {
  const originalHandleOnMounted
    = formRef.value.handleOnMounted.bind(formRef.value)
  formRef.value.handleOnMounted = () => {
    refreshFormStatus()
    emit('loaded')
    loaded.value = true
    originalHandleOnMounted()
  }
})

function validate() {
  return new Promise<boolean>((resolve) => {
    formRef.value.validateForm(resolve)
  })
}

async function handleSubmit() {
  if (!await validate())
    return
  emit('submit', formRef.value.formDataModel)
}
function handleReset() {
  formRef.value.resetForm()
  emit('reset')
}

defineExpose<AbstractFormMethods>({
  getFormData: () => formRef.value.formDataModel,
  setFormData: (data: any) => formRef.value.setFormData(data),
  resetForm: handleReset,
})
</script>

<template>
  <h1>{{ form.title }}</h1>
  <VFormRender ref="formRef" />
  <ElSpace v-if="loaded">
    <ElButton
      type="primary"
      :disabled
      :loading="submitting"
      @click="handleSubmit"
    >
      提交
    </ElButton>
    <ElButton :disabled @click="handleReset">
      清空
    </ElButton>
    <ElText v-if="disabled" tag="strong" type="warning">
      <FolderLock style="margin-right: 4px;" :size="18" />
      <span style="vertical-align: top;">你没有提交此表单的权限</span>
    </ElText>
  </ElSpace>
</template>

<style scoped>
h1 {
  font-size: 24px;
  text-align: center;
}

:deep() .el-form-item .el-form-item__label,
:deep() .el-form-item .el-checkbox__label {
  white-space: normal;
}

:deep() .el-form-item .el-checkbox {
  display: flex !important;
  height: min-content;
  padding-bottom: 14px;
}
:deep() .el-form-item .el-checkbox__label {
  line-height: 16px;
}
</style>
