export type Rsvp = {
    id: string
    parentName: string
    parentEmail: string
    parentMobile: string
    children: { name: string; dob: Date; hasAllergies: boolean; allergies?: string }[]
    message?: string
    rsvp: 'attending' | 'not-attending'
}
