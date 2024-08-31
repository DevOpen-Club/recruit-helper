<script lang="ts" setup>
import { MonitorCog, ShieldCheck } from 'lucide-vue-next'
import logo from '~/assets/logo.png'
import { UserType } from '~~/shared/types'

const user = computed(() => {
  const info = useCurrentUser().value
  if (!info)
    return { name: '', icon: () => {}, tag: '', tagType: 'info' }
  return {
    name: info?.name,
    icon: info.type === UserType.SYSTEM ? MonitorCog : ShieldCheck,
    tag: info.type === UserType.SYSTEM ? '系统用户' : '管理员',
    tagType: info.type === UserType.SYSTEM ? 'danger' : 'primary',
  }
})
</script>

<template>
  <ElHeader>
    <img class="logo" :src="logo" alt="Fanbook Recruit Helper">
    <ElText tag="h1">
      Fanbook Recruit Helper 管理后台
    </ElText>
    <div class="user-info">
      <ElTag :type="user.tagType">
        <component :is="user.icon" :size="14" />
        <span style="margin-left: 2px; vertical-align: text-top;">
          {{ user.tag }}
        </span>
      </ElTag>
      <ElText v-if="user.tagType !== 'danger'" style="margin-left: 8px;">
        {{ user.name }}
      </ElText>
    </div>
  </ElHeader>
  <ElDivider style="margin: 0;" />
</template>

<style scoped>
header {
  display: flex;
}

.logo {
  height: 40px;
  margin: 10px 0;
}
h1 {
  margin-left: 12px;
  font-size: 20px;
}

.user-info {
  display: flex;
  flex: 1;
  justify-content: right;
  align-items: center;
}
</style>
