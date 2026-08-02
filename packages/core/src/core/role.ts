export const ASSIGNABLE_ROLES = ['admin', 'studio-ipad', 'manager', 'facilitator'] as const

export const ROLES = [...ASSIGNABLE_ROLES, 'super-admin'] as const

export type Role = (typeof ROLES)[number]
