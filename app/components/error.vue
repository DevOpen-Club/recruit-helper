<script lang="ts" setup>
defineProps<{
  error: string
  showBack?: boolean
}>()

const reload = () => location.reload()
</script>

<template>
  <ElResult
    class="unknown-error"
    icon="error"
    title="发生了一点错误"
    sub-title="请联系管理员解决"
  >
    <template #extra>
      <pre v-if="error">{{ error }}</pre>
      <BackButton v-if="showBack" />
      <ElButton @click="reload">
        刷新
      </ElButton>
    </template>
  </ElResult>
</template>

<style>
.unknown-error .el-result__extra {
  margin-top: 8px;
}
.unknown-error pre {
  margin-bottom: 12px;
}
</style>
