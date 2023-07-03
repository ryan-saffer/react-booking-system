import { Locations } from '../booking/Locations'

export type Employee = {
    id: string
    firstName: string
    lastName: string
    email: string
    mobile: string
    wage: string
    commencementDate: string
    location: Locations
    managerName: string
    managerPosition: string
    senderName: string
    senderPosition: string
    status: 'form-sent' | 'verification' | 'complete'
}
