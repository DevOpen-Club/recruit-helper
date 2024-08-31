<script lang="ts" setup>
definePageMeta({
  middleware: ['auth'],
})

const { $api } = useNuxtApp()

type Status = 'loading' | 'mounting' | 'normal' | 'error'
const status = ref<Status>('loading')
const formId = ref<string | null>(null)
const error = ref<string | undefined>()

async function loadFormId() {
  const data = await $api('/api/meta')
  status.value = 'mounting'
  if (data.formId)
    formId.value = data.formId
  else
    status.value = 'normal'
}

onMounted(async () => {
  try {
    await loadFormId()
  }
  catch (e) {
    console.error(e)
    error.value = String(e)
    status.value = 'error'
  }
})
</script>

<template>
  <Error v-if="status === 'error'" :error />
  <template v-else>
    <div v-if="status !== 'normal'" v-loading.fullscreen="true" />
    <CustomForm v-if="formId" :id="formId" @loaded="status = 'normal'" />
    <ElEmpty v-else-if="status !== 'loading'" description="这里什么也没有" />
  </template>
</template>
