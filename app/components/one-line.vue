<template>
  <ElText class="one-line" tag="p" truncated :line-clamp="1">
    <slot />
  </ElText>
</template>

<style scoped>
.one-line {
  vertical-align: middle;
}
</style>
