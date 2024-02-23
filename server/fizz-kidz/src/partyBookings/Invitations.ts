import { Location } from '..'

type BaseInvitationProps = {
    childName: string
    childAge: string
    date: Date
    time: string
    rsvpName: string
    rsvpDate: Date
    rsvpNumber: string
}
type StudioInvitationProps = BaseInvitationProps & { $type: 'studio'; studio: Location }
type MobileInvitationProps = BaseInvitationProps & { $type: 'mobile'; address: string }

export type GenerateInvitation = StudioInvitationProps | MobileInvitationProps

export type Invitation = {
    id: string
    date: Date
    claimedDiscountCode: {
        name: string
        email: string
    }[]
}
