export const MASTER_STUDIOS = ['cheltenham', 'essendon', 'malvern'] as const
export const FRANCHISE_STUDIOS = ['balwyn', 'kingsville'] as const
export const STUDIOS = [...MASTER_STUDIOS, ...FRANCHISE_STUDIOS].sort((a, b) => (a < b ? -1 : 1))

export type Studio = (typeof STUDIOS)[number]
export type FranchiseStudio = (typeof FRANCHISE_STUDIOS)[number]

export type StudioOrMaster = Studio | 'master'
export type FranchiseOrMaster = FranchiseStudio | 'master'
export type StudioOrTest = Studio | 'test'

export function isFranchise(studio: StudioOrMaster): studio is FranchiseStudio {
    return FRANCHISE_STUDIOS.includes(studio as any)
}
