import { LocationOrMaster } from './location'
import { Role } from './role'
import { PartialRecord } from '..'

type BaseUser = {
    uid: string
    email: string
    imageUrl: string | null
    firstname?: string
    lastname?: string
}

export type StaffUser = BaseUser & {
    roles?: PartialRecord<LocationOrMaster, Role>
    accountType: 'staff'
}

export type CustomerUser = BaseUser & {
    accountType: 'customer'
}

export type AuthUser = StaffUser | CustomerUser
