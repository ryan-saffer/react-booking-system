import { Location } from '../core/location'

interface BaseEmployee {
    id: string
    created: number
    firstName: string
    lastName: string
    position: string
    email: string
    mobile: string
    commencementDate: string
    location: Location
    normalRate: number
    sundayRate: number
    managerName: string
    managerPosition: string
    senderName: string
    senderPosition: string
    contract: Contract
}

type EmployeeAdditionalInfo = BaseEmployee & {
    pronouns: string
    dob: string
    address: {
        full: string
        addressLine1: string
        city: string
        region: number
        postalCode: string
    }
    health: string
    tfnForm: File
    bankAccountName: string
    bsb: string
    accountNumber: string
    wwcc: WWCC
    emergencyContact: {
        name: string
        mobile: string
        relation: string
    }
    pdfSummary: string
}

export type Employee =
    | (BaseEmployee & { status: 'form-sent' })
    | (EmployeeAdditionalInfo & { status: 'generating-accounts' })
    | (EmployeeAdditionalInfo & {
          status: 'verification' | 'complete'
          driveFolderId: string
          // xeroUserId: string;
      })

export type InitiateEmployeeProps = {
    firstName: string
    lastName: string
    position: string
    email: string
    mobile: string
    commencementDate: string
    location: Location
    normalRate: number
    sundayRate: number
    managerName: string
    managerPosition: string
    senderName: string
    senderPosition: string
}

type File = {
    url: string
    filename: string
    mimeType: string
}

export type WWCC =
    | {
          status: 'I have a WWCC'
          photo: File
          cardNumber: string
      }
    | {
          status: 'I have applied for a WWCC and have an application number'
          applicationNumber: string
      }

type BaseContract = {
    id: string
    signUrl: string
}

type ContractNotSigned = BaseContract & {
    signed: false
}

type ContractSigned = BaseContract & {
    signed: true
    signedUrl: string
}

type Contract = ContractNotSigned | ContractSigned
