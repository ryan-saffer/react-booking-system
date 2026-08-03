export const STUDIOS = ['balwyn', 'cheltenham', 'essendon', 'geelong', 'kingsville', 'malvern', 'werribee'] as const

export type Studio = (typeof STUDIOS)[number]
