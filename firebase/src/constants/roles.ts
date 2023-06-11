export const ROLES = ['ADMIN', 'BASIC', 'RESTRICTED', 'BOOKKEEPER'] as const

export type Role = (typeof ROLES)[number]
