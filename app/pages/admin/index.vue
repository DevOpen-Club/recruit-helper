<script lang="ts" setup>
definePageMeta({
  middleware: ['auth', 'admin'],
})

const { $api } = useNuxtApp()

const stat = useFetch('/api/statistic', {
  $fetch: $api,
})
</script>

<template>
  <ElRow>
    <ElCol :span="6">
      <ElStatistic title="用户总数" :value="stat.data.value?.userCount" />
    </ElCol>
    <ElCol :span="6">
      <ElStatistic title="今日新用户数" :value="stat.data.value?.newUserCount1d" />
    </ElCol>
    <ElCol :span="6">
      <ElStatistic title="单据总数" :value="stat.data.value?.ticketCount" />
    </ElCol>
    <ElCol :span="6">
      <ElStatistic title="今日新单据数" :value="stat.data.value?.newTicketCount1d" />
    </ElCol>
  </ElRow>
</template>

<style scoped>
.el-col {
  text-align: center;
}
</style>
