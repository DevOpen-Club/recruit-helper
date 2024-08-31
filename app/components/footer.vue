<script lang="ts" setup>
import { LogOut } from 'lucide-vue-next'
import { version } from '~/utils/app'

const user = useCurrentUser()
</script>

<template>
  <ElFooter style="height: auto;">
    <ElText v-if="user" tag="p">
      当前登录用户：{{ user.name }}
      <ElButton size="small" @click="logout()">
        退出登录
        <template #icon>
          <LogOut />
        </template>
      </ElButton>
    </ElText>

    <ElText tag="p">
      Powered by
      <ElLink
        style="vertical-align: baseline;"
        href="https://github.com/DevOpen-Club/recruit-helper"
        target="_blank"
      >
        Fanbook Recruit Helper
      </ElLink>
      v{{ version }}
    </ElText>
  </ElFooter>
</template>

<style scoped>
footer > * {
  text-align: center;
}
footer:last-child {
  margin-bottom: 4px;
}
</style>
