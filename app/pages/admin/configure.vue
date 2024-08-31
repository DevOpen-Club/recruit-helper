<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { SystemStatus } from '~~/shared/types'

const { $api } = useNuxtApp()

definePageMeta({
  middleware: ['auth', 'admin'],
})

const form = useFetch('/api/meta', {
  $fetch: $api,
  deep: true,
})
const isLoading = computed(() => form.status.value === 'pending')

const announcementEnabled = computed({
  get: () => form.data.value && form.data.value.announcement !== null,
  set: v => form.data.value!.announcement = v ? '' : null,
})
const indexFormEnabled = computed({
  get: () => form.data.value && form.data.value.formId !== null,
  set: v => form.data.value!.formId = v ? '' : null,
})

const submitting = ref(false)
async function handleSubmit() {
  submitting.value = true
  try {
    await $api('/api/meta', {
      method: 'PATCH',
      body: form.data.value,
    })
  }
  catch (e) {
    console.error(e)
    ElMessage.error('保存失败')
  }
  submitting.value = false
  form.refresh()
}
</script>

<template>
  <ElForm
    v-if="form.data.value"
    v-loading="isLoading"
    :model="form.data.value"
    label-width="auto"
  >
    <ElFormItem label="系统状态" name="status">
      <ElSelect v-model="form.data.value.status" style="width: 200px;">
        <ElOption label="正常" :value="SystemStatus.NORMAL" />
        <ElOption label="关闭" :value="SystemStatus.CLOSED" />
      </ElSelect>
    </ElFormItem>

    <ElFormItem label="公告" name="announcement">
      <ElSwitch v-model="announcementEnabled" />
      <ElInput
        v-if="announcementEnabled"
        v-model="form.data.value.announcement"
        type="textarea"
        :rows="4"
        placeholder="请输入公告内容"
      />
    </ElFormItem>

    <ElFormItem label="新用户自动注册" name="openSignup">
      <ElSwitch v-model="form.data.value.openSignup" />
    </ElFormItem>

    <ElFormItem label="首页显示的表单" name="formId">
      <ElSwitch v-model="indexFormEnabled" />
      <ElInput
        v-if="indexFormEnabled"
        v-model="form.data.value.formId"
        style="width: 240px; margin-left: 8px;"
      />
    </ElFormItem>

    <ElFormItem>
      <ElButton type="primary" :loading="submitting" @click="handleSubmit">
        保存
      </ElButton>
    </ElFormItem>
  </ElForm>
</template>
