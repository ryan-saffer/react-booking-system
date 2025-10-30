const MASTER_STUDIOS = ['cheltenham', 'essendon', 'kingsville', 'malvern'] as const

const FRANCHISE_STUDIOS = ['balwyn'] as const

export const STUDIOS = [...MASTER_STUDIOS, ...FRANCHISE_STUDIOS]

export type Studio = (typeof STUDIOS)[number]

export type StudioOrMaster = Studio | 'master'

export type StudioOrTest = Studio | 'test'
