import { PermissionItemType } from './types'

export const FORM_ATTACHMENT_MAX_SIZE = 10 * 1024 * 1024 // 10MB

export const PermissionTypeText: Record<PermissionItemType, string> = {
  [PermissionItemType.NO_PERMISSION]: '不可查看',
  [PermissionItemType.VIEW]: '仅查看',
  [PermissionItemType.SUBMIT]: '可提交',
}
