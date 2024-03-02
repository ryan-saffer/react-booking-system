import { InvitationOption } from "fizz-kidz";

export const InvitationTemplates: Record<InvitationOption, { invitation: string, envelope: string}> = {
    Freckles: { invitation: '/Invitation-Freckles.png', envelope: '/Envelope-Freckles.png' },
    Stripes: { invitation: '/Invitation-Stripes.png', envelope: '/Envelope-Stripes.png' },
    Dots: { invitation: '/Invitation-Dots.png', envelope: '/Envelope-Dots.png' },
    'Glitz & Glam': { invitation: '/Invitation-Glitz.png', envelope: '/Envelope-Glitz.png' },
    'Bubbling Fun': { invitation: '/Invitation-Bubbling.png', envelope: '/Envelope-Bubbling.png' },
    'Bubbling Blue Fun': { invitation: '/Invitation-Bubbling-Blue.png', envelope: '/Envelope-Bubbling-Blue.png' },
    'Slime Time': { invitation: '/Invitation-Slime.png', envelope: '/Envelope-Slime.png' },
    'Tye Dye': { invitation: '/Invitation-Tye-Dye.png', envelope: '/Envelope-Tye-Dye.png' },
}