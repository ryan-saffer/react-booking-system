import { randomUUID } from 'crypto'

import { StorageClient } from '@/firebase/StorageClient'
import { projectId } from '@/init'
import { isUsingEmulator, throwTrpcError } from '@/utilities'

type GetAnaphylaxisPlanUrlInput = {
    anaphylaxisPlanUrl: string
}

const ANAPHYLAXIS_PLAN_PREFIX = 'anaphylaxisPlans/holiday-program-'

export async function getAnaphylaxisPlanUrl(input: GetAnaphylaxisPlanUrlInput) {
    const bucketName = `${projectId}.appspot.com`
    const storagePath = getStoragePath(input.anaphylaxisPlanUrl, bucketName)

    validateStoragePath(storagePath)

    const storage = await StorageClient.getInstance()
    const file = storage.bucket(bucketName).file(storagePath)

    if (isUsingEmulator()) {
        const downloadToken = randomUUID()
        await file.setMetadata({
            metadata: {
                firebaseStorageDownloadTokens: downloadToken,
            },
        })

        return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(storagePath)}?alt=media&token=${downloadToken}`
    }

    const [signedUrl] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 15 * 60 * 1000,
    })

    return signedUrl
}

function getStoragePath(value: string, bucketName: string) {
    const trimmedValue = value.trim()

    if (trimmedValue.startsWith('anaphylaxisPlans/')) {
        return trimmedValue
    }

    let url: URL
    try {
        url = new URL(trimmedValue)
    } catch (err) {
        throwTrpcError('BAD_REQUEST', 'invalid anaphylaxis plan URL', err, { value })
    }

    if (url.hostname === 'storage.googleapis.com') {
        const [bucket, ...pathParts] = url.pathname.replace(/^\/+/, '').split('/')
        if (bucket !== bucketName) {
            throwTrpcError('BAD_REQUEST', 'invalid anaphylaxis plan bucket')
        }

        return decodeURIComponent(pathParts.join('/'))
    }

    if (url.hostname === `${bucketName}.storage.googleapis.com`) {
        return decodeURIComponent(url.pathname.replace(/^\/+/, ''))
    }

    if (url.hostname === 'firebasestorage.googleapis.com') {
        const match = url.pathname.match(/^\/v0\/b\/([^/]+)\/o\/(.+)$/)
        if (!match || match[1] !== bucketName) {
            throwTrpcError('BAD_REQUEST', 'invalid anaphylaxis plan bucket')
        }

        return decodeURIComponent(match[2])
    }

    throwTrpcError('BAD_REQUEST', 'invalid anaphylaxis plan URL host')
}

function validateStoragePath(storagePath: string) {
    if (!storagePath.startsWith(ANAPHYLAXIS_PLAN_PREFIX)) {
        throwTrpcError('BAD_REQUEST', `invalid anaphylaxis plan path: ${storagePath}`)
    }

    if (storagePath.slice('anaphylaxisPlans/'.length).includes('/')) {
        throwTrpcError('BAD_REQUEST', `invalid anaphylaxis plan path: ${storagePath}`)
    }
}
