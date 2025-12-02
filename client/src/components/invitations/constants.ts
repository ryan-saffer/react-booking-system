import type { InvitationOption } from 'fizz-kidz'

export const InvitationTemplates: Record<
    InvitationOption,
    { invitation: string; envelope: string; invitationAndEnvelope: string }
> = {
    Freckles: {
        invitation: '/invitations/Invitation-Freckles.png',
        envelope: '/invitations/Envelope-Freckles.png',
        invitationAndEnvelope: '/invitations/Invitation+Envelope-Freckles.png',
    },
    Stripes: {
        invitation: '/invitations/Invitation-Stripes.png',
        envelope: '/invitations/Envelope-Stripes.png',
        invitationAndEnvelope: '/invitations/Invitation+Envelope-Stripes.png',
    },
    Dots: {
        invitation: '/invitations/Invitation-Dots.png',
        envelope: '/invitations/Envelope-Dots.png',
        invitationAndEnvelope: '/invitations/Invitation+Envelope-Dots.png',
    },
    'Glitz & Glam': {
        invitation: '/invitations/Invitation-Glitz.png',
        envelope: '/invitations/Envelope-Glitz.png',
        invitationAndEnvelope: '/invitations/Invitation+Envelope-Glitz.png',
    },
    'Bubbling Fun': {
        invitation: '/invitations/Invitation-Bubbling.png',
        envelope: '/invitations/Envelope-Bubbling.png',
        invitationAndEnvelope: '/invitations/Invitation+Envelope-Bubbling.png',
    },
    'Bubbling Blue Fun': {
        invitation: '/invitations/Invitation-Bubbling-Blue.png',
        envelope: '/invitations/Envelope-Bubbling-Blue.png',
        invitationAndEnvelope: '/invitations/Invitation+Envelope-Bubbling-Blue.png',
    },
    'Slime Time': {
        invitation: '/invitations/Invitation-Slime.png',
        envelope: '/invitations/Envelope-Slime.png',
        invitationAndEnvelope: '/invitations/Invitation+Envelope-Slime.png',
    },
    'Tie Dye': {
        invitation: '/invitations/Invitation-Tye-Dye.png',
        envelope: '/invitations/Envelope-Tye-Dye.png',
        invitationAndEnvelope: '/invitations/Invitation+Envelope-Tye-Dye.png',
    },
    Swiftie: {
        invitation: '/invitations/Invitation-Swift.png',
        envelope: '/invitations/Envelope-Swift.png',
        invitationAndEnvelope: '/invitations/Invitation+Envelope-Swift.png',
    },
    'K-pop Demon Hunters': {
        invitation: '/invitations/Invitation-Kpop.png',
        envelope: '/invitations/Envelope-Kpop.png',
        invitationAndEnvelope: '/invitations/Invitation+Envelope-Kpop.png',
    },
}
