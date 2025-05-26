import type { InvitationOption } from 'fizz-kidz'

export const InvitationTemplates: Record<InvitationOption, { invitation: string; envelope: string }> = {
    Freckles: { invitation: '/invitations/Invitation-Freckles.png', envelope: '/invitations/Envelope-Freckles.png' },
    Stripes: { invitation: '/invitations/Invitation-Stripes.png', envelope: '/invitations/Envelope-Stripes.png' },
    Dots: { invitation: '/invitations/Invitation-Dots.png', envelope: '/invitations/Envelope-Dots.png' },
    'Glitz & Glam': { invitation: '/invitations/Invitation-Glitz.png', envelope: '/invitations/Envelope-Glitz.png' },
    'Bubbling Fun': {
        invitation: '/invitations/Invitation-Bubbling.png',
        envelope: '/invitations/Envelope-Bubbling.png',
    },
    'Bubbling Blue Fun': {
        invitation: '/invitations/Invitation-Bubbling-Blue.png',
        envelope: '/invitations/Envelope-Bubbling-Blue.png',
    },
    'Slime Time': { invitation: '/invitations/Invitation-Slime.png', envelope: '/invitations/Envelope-Slime.png' },
    'Tie Dye': { invitation: '/invitations/Invitation-Tye-Dye.png', envelope: '/invitations/Envelope-Tye-Dye.png' },
    Swiftie: { invitation: '/invitations/Invitation-Swift.png', envelope: '/invitations/Envelope-Swift.png' },
}
