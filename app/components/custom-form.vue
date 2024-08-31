<script lang="ts" setup>
import type { AbstractFormMethods } from '~/components/abstract-form.vue'
import { PermissionItemType } from '~~/shared/types'
import type { Form } from '~~/shared/types'

const props = defineProps<{
  id: string
}>()
const emit = defineEmits<{
  loaded: []
}>()

const { $api } = useNuxtApp()

type Status = 'loading' | 'filling' | 'submitting' | 'submitted' | 'error'
const status = ref<Status>('loading')
const error = ref<string | undefined>()
const reachedMaxTicket = ref(false)

const form = ref<Form>({
  title: '',
  structure: {},
  noteAfterSubmitting: null,
})
const formRef = ref<AbstractFormMethods | null>(null)
const noteAfterSubmitting = ref<string | undefined>()
const disabled = ref(false)

async function loadForm() {
  try {
    const data = await $api(`/api/forms/${props.id}`)
    form.value = data.form
    noteAfterSubmitting.value = data.form.noteAfterSubmitting ?? undefined
    disabled.value = data.permission < PermissionItemType.SUBMIT
    reachedMaxTicket.value = data.reachedMaxTicket
  }
  catch (e) {
    console.error(e)
    status.value = 'error'
    error.value = String(e)
  }
}

onBeforeMount(async () => {
  await loadForm()
  if (reachedMaxTicket.value && !useUserPrivileged().value)
    status.value = 'submitted'
  else
    status.value = 'filling'
})

const draft = useLocalStorage<any>(`draft/${props.id}`, {})
function saveDraft() {
  if (formRef.value)
    draft.value = formRef.value.getFormData()
}

function handleLoaded() {
  // 恢复草稿
  if (formRef.value)
    formRef.value.setFormData(draft.value)
  useIntervalFn(() => {
    if (status.value === 'filling')
      saveDraft()
  }, 10 * 1000) // 10s
  emit('loaded')
}

async function handleSubmit(data: any) {
  status.value = 'submitting'
  saveDraft()
  await $api(`/api/forms/${props.id}/tickets`, {
    method: 'POST',
    body: {
      form: data,
    },
  })
  await loadForm()
  status.value = 'submitted'
}

const reload = () => location.reload()
</script>

<template>
  <Error v-if="status === 'error'" :error />
  <ElResult
    v-else-if="status === 'submitted'"
    icon="success"
    title="提交成功"
    :sub-title="noteAfterSubmitting"
  >
    <template #extra>
      <BackButton />
      <ElButton
        v-if="!reachedMaxTicket || useUserPrivileged()"
        @click="reload"
      >
        再填一份
      </ElButton>
    </template>
  </ElResult>
  <AbstractForm
    v-else
    ref="formRef"
    :disabled
    :submitting="status === 'submitting'"
    :form
    @loaded="handleLoaded"
    @submit="handleSubmit"
    @reset="saveDraft"
  />
</template>
