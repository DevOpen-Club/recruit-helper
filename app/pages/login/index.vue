<script lang="ts" setup>
import { ElLoading } from 'element-plus'

const next = String(useRoute().query.next ?? '/')

function loginByFanbook() {
  const to = new URL('https://a1.fanbook.cn/open/oauth2/authorize')
  to.searchParams.set('response_type', 'code')
  to.searchParams.set('client_id', useRuntimeConfig().public.fanbookAppClientId)
  to.searchParams.set('state', next)
  window.location.href = to.href
}

if (!useCurrentUser().value) {
  ElLoading.service({ text: '正在登录' })
  loginByFanbook()
}
else {
  navigateTo(next, { replace: true })
}
</script>
