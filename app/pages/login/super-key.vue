<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { ArrowRight } from 'lucide-vue-next'
import { FetchError } from 'ofetch'

const superKey = ref('')
const submitting = ref(false)

async function login() {
  if (!superKey.value.length)
    return ElMessage.error('请输入 Super Key')
  submitting.value = true
  try {
    useCurrentUser().value = await $fetch('/api/auth/super-key', {
      method: 'POST',
      body: {
        key: superKey.value,
      },
    })
    ElMessage.success('验证通过')
    navigateTo('/admin', { replace: true })
  }
  catch (e) {
    alertApiError(e)
  }
  superKey.value = ''
  submitting.value = false
}
</script>

<template>
  <div class="wrapper">
    <ElText tag="h1">
      请输入 Super Key
    </ElText>
    <ElInput v-model="superKey" style="width: 400px;" type="password">
      <template #append>
        <ElButton
          type="primary"
          :loading="submitting"
          autocomplete="new-password"
          @click="login"
        >
          <ArrowRight v-if="!submitting" :size="16" />
        </ElButton>
      </template>
    </ElInput>
  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  flex-direction: column;
  height: 100%;
}

h1 {
  font-size: 20px;
  margin-bottom: 12px;
}
</style>
