<script lang="ts" setup>
import { BookCheck, CircleGauge, Settings, UserRoundCog } from 'lucide-vue-next'

const items: Array<{
  icon: any
  title: string
  route: string
}> = [
  { icon: CircleGauge, title: '仪表盘', route: '/admin' },
  { icon: UserRoundCog, title: '用户管理', route: '/admin/user' },
  { icon: BookCheck, title: '表单管理', route: '/admin/form' },
  { icon: Settings, title: '系统设置', route: '/admin/configure' },
]
</script>

<template>
  <ElAside style="width: 200px;">
    <ElMenu :default-active="useRoute().path" router>
      <ElMenuItem v-for="item in items" :key="item.route" :index="item.route">
        <component :is="item.icon" class="item-icon" :size="18" />
        {{ item.title }}
      </ElMenuItem>
      <p style="flex: 1;" aria-hidden />
    </ElMenu>
  </ElAside>
</template>

<style scoped>
.el-menu {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.item-icon {
  margin-right: 8px;
}
</style>
