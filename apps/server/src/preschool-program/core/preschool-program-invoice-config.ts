import { env } from '@/init'

const PRESCHOOL_PROGRAM_CATALOG_OBJECT_IDS = {
    prod: 'QG6IJP4BMHR7UM6CWLO6AJHK',
    dev: 'XNGVRY2YK2JICTVIFJLV4EEP',
} as const

export function getPreschoolProgramInvoiceCatalogObjectId() {
    const catalogObjectId =
        env === 'prod' ? PRESCHOOL_PROGRAM_CATALOG_OBJECT_IDS.prod : PRESCHOOL_PROGRAM_CATALOG_OBJECT_IDS.dev

    return catalogObjectId
}
