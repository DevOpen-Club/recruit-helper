<script lang="ts" setup>
import { ErrorMessages } from '~~/shared/errors'

const id = computed(() => {
  const pure = useRoute().params.id
  return typeof pure === 'string' ? pure : undefined
})
</script>

<template>
  <CustomForm v-if="id" :id />
  <ElEmpty v-else :description="ErrorMessages.FORM_NOT_FOUND" />
</template>
