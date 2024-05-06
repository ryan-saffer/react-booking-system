import { LocationOrMaster } from './location'
import { Role } from './role'
import { PartialRecord } from '..'

type BaseAuthUser = {
    uid: string
    email: string
    imageUrl: string | null
    firstname?: string
    lastname?: string
}

export type StaffAuthUser = BaseAuthUser & {
    roles: PartialRecord<LocationOrMaster, Role>
    accountType: 'staff'
}

export type CustomerAuthUser = BaseAuthUser & {
    accountType: 'customer'
}

export type AuthUser = StaffAuthUser | CustomerAuthUser
