export const ROLES = ['admin', 'studio-ipad', 'manager', 'facilitator'] as const

export type Role = (typeof ROLES)[number]
