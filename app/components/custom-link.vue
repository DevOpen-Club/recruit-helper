<script lang="ts" setup>
import { Link } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  href: string
  target?: string
}>(), {
  target: '_self',
})

const internal = computed(() => {
  return props.target === '_self' && props.href[0] === '/'
})

const [DefineUiLink, UiLink] = createReusableTemplate()
</script>

<template>
  <DefineUiLink>
    <ElLink v-bind="$attrs" :href :target type="primary">
      <slot />
      <template #icon>
        <Link class="link-icon" />
      </template>
    </ElLink>
  </DefineUiLink>

  <NuxtLink v-if="internal" custom #="{ navigate }">
    <UiLink @click="navigate" />
  </NuxtLink>
  <UiLink v-else />
</template>

<style scoped>
.link-icon {
  height: 1em;
  width: 1em;
  margin-left: 2px;
}
</style>
