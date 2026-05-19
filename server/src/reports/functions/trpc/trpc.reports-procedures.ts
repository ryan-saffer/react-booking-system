import { RolePermissionMap, isStudio } from 'fizz-kidz'
import type { Permission, StudioOrMaster } from 'fizz-kidz'

import { DatabaseClient } from '@/firebase/DatabaseClient'
import { authenticatedProcedure } from '@/trpc/trpc'
import { throwTrpcError } from '@/utilities'

export const reportReadProcedure = createReportProcedure('admin', 'studio')

function createReportProcedure(permission: Permission, studioField: 'studio') {
    return authenticatedProcedure.use(async ({ ctx, getRawInput, next }) => {
        const studio = getStudioOrMasterFromInput(await getRawInput(), studioField)

        if (!studio) {
            throwTrpcError('BAD_REQUEST', `reports require a valid '${studioField}'`)
        }

        await assertReportPermission({ uid: ctx.uid, studio, permission })
        return next()
    })
}

function getStudioOrMasterFromInput(input: unknown, field: 'studio') {
    if (!input || typeof input !== 'object') return undefined

    const studio = (input as Record<string, unknown>)[field]
    if (studio === 'master') return studio
    if (typeof studio === 'string' && isStudio(studio)) return studio

    return undefined
}

async function assertReportPermission(input: { uid: string; studio: StudioOrMaster; permission: Permission }) {
    const user = await DatabaseClient.getUser(input.uid)
    if (user?.accountType !== 'staff' || !user.roles) {
        throwTrpcError('FORBIDDEN', 'reports require staff access')
    }

    const studioRole = input.studio === 'master' ? undefined : user.roles[input.studio]
    const masterRole = user.roles.master

    if (studioRole && RolePermissionMap[studioRole].includes(input.permission)) {
        return
    }

    if (masterRole && RolePermissionMap[masterRole].includes(input.permission)) {
        return
    }

    throwTrpcError('FORBIDDEN', `reports require '${input.permission}' permission for '${input.studio}'`)
}
