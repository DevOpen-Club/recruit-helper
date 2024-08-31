export const ErrorMessages = {
  UNKNOWN_ERROR: '未知错误',
  BAD_REQUEST: '请求参数错误',
  UNAUTHORIZED: '请先登录',
  PERMISSION_DENIED: '权限不足',
  BAD_CONFIGURE: '系统配置错误',
  SYSTEM_CLOSED: '系统已关闭，服务不可用',
  BAD_SESSION: '鉴权失败，请重新登录',
  SESSION_EXPIRED: '会话已过期，请重新登录',
  FORM_NOT_FOUND: '表单不存在',
  IN_FORM_BLACKLIST: '你在此表单的黑名单中',
  REACHED_MAX_TICKET_COUNT: '提交次数已达上限',
  ATTACHMENT_TOO_LARGE: '上传的文件过大',
  UPSTREAM_LARK_ERROR: '上游飞书服务错误',
  NOT_IN_FANBOOK_GUILD: '你还未加入 Fanbook 社区',
  AUTO_SIGNUP_DISABLED: '当前身份未关联账号，请联系管理员为你开通账号',
  USER_SUSPENDED: '你的账号已被封禁',
  OAUTH2_CODE_EXPIRED: '授权已过期，请重试',
  WRONG_SUPER_KEY: 'Super Key 错误',
} as const