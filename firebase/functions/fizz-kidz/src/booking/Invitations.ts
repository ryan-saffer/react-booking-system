export enum Invitation {
    Freckles,
    Dots,
}

export type DownloadInvitationParams = {
    invitation: Invitation
    childName: string
    childAge: string
    date: string
    time: string
    rsvp: string
}
