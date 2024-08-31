import z from 'zod'

export const dbObjectIdSchema = z.string().refine(val => /^[0-9a-f]{24}$/.test(val), {
  message: 'Invalid ObjectId',
})

export const PageSchema = z.number().int().min(1)
export const PageSizeSchema = z.number().int().min(1).max(100)

export enum SystemStatus {
  NORMAL,
  CLOSED,
  CRASHED = -1,
}

export const SystemStatusInfoSchema = z.object({
  status: z.nativeEnum(SystemStatus),
  announcement: z.string().nullable(),
  formId: dbObjectIdSchema.nullable(),
  openSignup: z.boolean(),
})
export type SystemStatusInfo = z.infer<typeof SystemStatusInfoSchema>

export const StatisticDataSchema = z.object({
  userCount: z.number(),
  newUserCount1d: z.number(),
  ticketCount: z.number(),
  newTicketCount1d: z.number(),
})
export type StatisticData = z.infer<typeof StatisticDataSchema>

export enum UserType {
  SYSTEM,
  USER,
  ADMIN,
}

export enum UserStatus {
  NORMAL,
  SUSPENDED,
}

export const UserSchema = z.object({
  id: dbObjectIdSchema,
  name: z.string(),
  type: z.nativeEnum(UserType),
  status: z.nativeEnum(UserStatus),
})
export type User = z.infer<typeof UserSchema>

export const UserFullSchema = UserSchema.extend({
  session: z.string(),
  sessionExpireTime: z.coerce.date(),
  suspensionReason: z.string().nullable(),
  suspensionEndTime: z.coerce.date().nullable(),
})
export type UserFull = z.infer<typeof UserFullSchema>

export enum PermissionItemType {
  NO_PERMISSION,
  VIEW,
  SUBMIT,
}

export const FormSchema = z.object({
  id: dbObjectIdSchema.optional(),
  title: z.string(),
  structure: z.object({}).passthrough(),
  noteAfterSubmitting: z.string().nullable(),
})
export type Form = z.infer<typeof FormSchema>

export const FormFullSchema = FormSchema.extend({
  basePermission: z.nativeEnum(PermissionItemType),
  larkApprovalDefination: z.string(),
  larkApprovalWidgets: z.object({}).passthrough(),
  maxTicketPerUser: z.number().int().min(1).nullable(),
})
export type FormFull = z.infer<typeof FormFullSchema>

export const TicketAttachmentTypeSchema = z.enum(['attachment', 'image'])
export type TicketAttachmentType = z.infer<typeof TicketAttachmentTypeSchema>

export const LarkWidgetSchema = z.object({
  field: z.string(),
  type: z.string(),
})
export type LarkWidget = z.infer<typeof LarkWidgetSchema>
