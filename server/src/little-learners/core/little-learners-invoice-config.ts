import { env } from '@/init'

const LITTLE_LEARNERS_CATALOG_OBJECT_IDS = {
    prod: 'QG6IJP4BMHR7UM6CWLO6AJHK',
    dev: 'XNGVRY2YK2JICTVIFJLV4EEP',
} as const

export function getLittleLearnersInvoiceCatalogObjectId() {
    const catalogObjectId =
        env === 'prod' ? LITTLE_LEARNERS_CATALOG_OBJECT_IDS.prod : LITTLE_LEARNERS_CATALOG_OBJECT_IDS.dev

    return catalogObjectId
}
