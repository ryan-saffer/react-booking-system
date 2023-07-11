import { Locations } from '../booking/Locations'

export type Employee = {
    id: string
    created: number
    firstName: string
    lastName: string
    position: string
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
    contractUrl?: string
    contractSigned: boolean
    contractSignedUrl?: string
    baseWage: number
    commencementDate: string
    location: Exclude<Locations, 'mobile'>
    managerName: string
    managerPosition: string
    senderName: string
    senderPosition: string
    slingUserId?: string
    xeroUserId?: string
    status: 'form-sent' | 'generating-accounts' | 'verification' | 'complete'
}

type File = {
    url: string
    filename: string
    mimeType: string
}

export type NewEmployee = Omit<Employee, 'id' | 'status' | 'created' | 'contractSigned'>