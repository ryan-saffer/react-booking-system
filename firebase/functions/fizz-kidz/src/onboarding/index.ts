import { Locations } from '../booking/Locations'

export type Employee = {
    id: string
    firstName: string
    lastName: string
    pronouns?: string
    dob?: string
    email: string
    mobile: string
    address?: string
    health?: string
    tfnForm?: File
    bankAccountName?: string
    bsb?: string
    accountNumber?: string
    wwccStatus?: string
    wwccPhoto?: File
    wwccCardNumber?: string
    wwccApplicationNumber?: string
    emergencyContactName?: string
    emergencyContactMobile?: string
    emergencyContactRelation?: string
    pdfSummary?: string
    contract?: string
    wage: string
    commencementDate: string
    location: Locations
    managerName: string
    managerPosition: string
    senderName: string
    senderPosition: string
    status: 'form-sent' | 'generating-accounts' | 'verification' | 'complete'
}

type File = {
    url: string
    filename: string
    mimeType: string
}
