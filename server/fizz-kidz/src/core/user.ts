import type { LocationOrMaster } from './location'
import type { Role } from './role'
import type { PartialRecord } from '..'

type BaseAuthUser = {
    uid: string
    email: string
    imageUrl: string | null
    firstname?: string
    lastname?: string
}

export type StaffAuthUser = BaseAuthUser & {
    roles?: PartialRecord<LocationOrMaster, Role>
    accountType: 'staff'
}

export type CustomerAuthUser = BaseAuthUser & {
    accountType: 'customer'
}

export type AuthUser = StaffAuthUser | CustomerAuthUser
