import { LocationOrMaster } from './location'
import { Role } from './role'
import { PartialRecord } from '..'

type BaseUser = {
    uid: string
    imageUrl: string | null
    email?: string
    firstname?: string
    lastname?: string
}

type BaseVerifiedUser = BaseUser & {
    email: string
    isAnonymous: false
}

export type StaffUser = BaseVerifiedUser & {
    roles?: PartialRecord<LocationOrMaster, Role>
    accountType: 'staff'
}

export type CustomerUser = BaseVerifiedUser & {
    accountType: 'customer'
}

export type AnonymousCustomerUser = BaseUser & {
    accountType: 'customer'
    isAnonymous: true
}

export type AuthUser = StaffUser | CustomerUser | AnonymousCustomerUser
