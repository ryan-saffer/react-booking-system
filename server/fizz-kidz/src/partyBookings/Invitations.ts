import { Location } from '..'

type BaseInvitationProps = {
    childName: string
    childAge: string
    date: Date
    time: string
    rsvpName: string
    rsvpDate: Date
    rsvpNumber: string
    invitation: InvitationOption
}
type StudioInvitationProps = BaseInvitationProps & { $type: 'studio'; studio: Location }
type MobileInvitationProps = BaseInvitationProps & { $type: 'mobile'; address: string }

export type GenerateInvitation = StudioInvitationProps | MobileInvitationProps

// Stored in firestore
export type Invitation = {
    id: string
    date: Date
    claimedDiscountCode: {
        name: string
        email: string
    }[]
}

export type InvitationOption =
    | 'Freckles'
    | 'Stripes'
    | 'Dots'
    | 'Glitz & Glam'
    | 'Bubbling Fun'
    | 'Bubbling Blue Fun'
    | 'Slime Time'
    | 'Tye Dye'
    | 'Taylor Swift'
