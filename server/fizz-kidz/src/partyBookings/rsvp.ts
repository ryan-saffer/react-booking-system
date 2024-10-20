export type Rsvp = {
    id: string
    parentName: string
    parentEmail: string
    parentMobile: string
    children: Child[]
    message?: string
}

type Child = {
    name: string
    dob: Date
    rsvp: 'attending' | 'not-attending'
    hasAllergies?: boolean
    allergies?: string
}

export type RsvpStatus = Rsvp['children'][number]['rsvp']
