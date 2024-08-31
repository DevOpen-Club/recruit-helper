import { ElMessage } from 'element-plus'
import { FetchError } from 'ofetch'

export { version } from '~~/package.json'

export const clone = structuredClone

/** 提示 API 错误信息，建议在通过 `$api` 请求时在 catch-block 中调用 */
export function alertApiError(error: unknown) {
  if (error instanceof FetchError && error.data.message) {
    if (error.status === 429)
      ElMessage.error('操作过于频繁，请稍后再试')
    else
      ElMessage.error(error.data.message)
  }
  else {
    console.error(error)
    ElMessage.error('发生未知错误，请联系管理员解决')
  }
}
