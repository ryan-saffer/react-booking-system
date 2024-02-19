import { Location } from '..'

type BaseInvitationProps = { childName: string; childAge: string; date: string; time: string }
type StudioInvitationProps = BaseInvitationProps & { $type: 'studio'; studio: Location }
type MobileInvitationProps = BaseInvitationProps & { $type: 'mobile'; address: string }

export type GenerateInvitation = StudioInvitationProps | MobileInvitationProps
