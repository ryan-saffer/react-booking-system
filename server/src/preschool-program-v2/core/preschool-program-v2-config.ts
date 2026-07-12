import { env } from '@/init'

const PRESCHOOL_PROGRAM_V2_SESSION_CATALOG_OBJECT_IDS = {
    prod: 'QG6IJP4BMHR7UM6CWLO6AJHK',
    dev: 'XNGVRY2YK2JICTVIFJLV4EEP',
} as const

export function getPreschoolProgramV2SessionCatalogObjectId() {
    return env === 'prod'
        ? PRESCHOOL_PROGRAM_V2_SESSION_CATALOG_OBJECT_IDS.prod
        : PRESCHOOL_PROGRAM_V2_SESSION_CATALOG_OBJECT_IDS.dev
}

export const FULL_TERM_DISCOUNT_UID = 'full-term-discount'
export const FULL_TERM_DISCOUNT_PERCENTAGE = 20
