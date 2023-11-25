import { onRequest } from 'firebase-functions/v2/https'
import { logger } from 'firebase-functions/v2'
import { DatabaseClient } from '../../../firebase/DatabaseClient'
import { Employee, WWCC } from 'fizz-kidz'
import { publishToPubSub } from '../../../utilities'
import { State } from 'xero-node/dist/gen/model/payroll-au/state'

type BasePFResponse = {
    custom_key: string
}

type PFFileResponse = BasePFResponse & {
    type: 'file'
    value: { url: string; name: string; type: string }
}

type PFTextResponse = BasePFResponse & {
    type: 'text' | 'id' | 'address_street' | 'address_suburb' | 'address_state' | 'address_postcode'
    value: string
}

type PFResponse = PFFileResponse | PFTextResponse
const PDF_KEY = '7843d2a'

export const onOnboardingSubmit = onRequest(async (req, res) => {
    const data = req.body.data as PFResponse[]

    const employeeId = data.find((it): it is PFTextResponse => it.custom_key === 'id')!.value
    const existingEmployee = await DatabaseClient.getEmployee(employeeId)

    if (existingEmployee.status !== 'form-sent') {
        logger.log(
            `employee form already submitted for ${existingEmployee.firstName} ${existingEmployee.lastName} - exiting`
        )
        return
    }

    const wwccStatus = data.find((it): it is PFTextResponse => it.custom_key === 'wwccStatus')!.value as WWCC['status']
    let wwcc: WWCC

    if (wwccStatus === 'I have a WWCC') {
        const photo = data.find((it): it is PFFileResponse => it.custom_key === 'wwccPhoto')!.value
        wwcc = {
            status: wwccStatus,
            photo: {
                url: photo.url,
                filename: photo.name,
                mimeType: photo.type,
            },
            cardNumber: data.find((it): it is PFTextResponse => it.custom_key === 'wwccCardNumber')!.value,
        }
    } else {
        wwcc = {
            status: wwccStatus,
            applicationNumber: data.find((it): it is PFTextResponse => it.custom_key === 'wwccApplicationNumber')!
                .value,
        }
    }

    const employee = {
        ...existingEmployee,
        firstName: data.find((it): it is PFTextResponse => it.custom_key === 'firstName')!.value,
        lastName: data.find((it): it is PFTextResponse => it.custom_key === 'lastName')!.value,
        pronouns: data.find((it): it is PFTextResponse => it.custom_key === 'pronouns')!.value,
        dob: data.find((it): it is PFTextResponse => it.custom_key === 'dob')!.value,
        email: data.find((it): it is PFTextResponse => it.custom_key === 'email')!.value,
        mobile: data.find((it): it is PFTextResponse => it.custom_key === 'mobile')!.value,
        address: {
            full: data.find((it): it is PFTextResponse => it.custom_key === 'address')!.value,
            addressLine1: data.find((it): it is PFTextResponse => it.type === 'address_street')!.value,
            city: data.find((it): it is PFTextResponse => it.type === 'address_suburb')!.value,
            region: getState(data.find((it): it is PFTextResponse => it.type === 'address_state')!.value)!,
            postalCode: data.find((it): it is PFTextResponse => it.type === 'address_postcode')!.value,
        },
        health: data.find((it): it is PFTextResponse => it.custom_key === 'health')!.value,
        tfnForm: {
            url: data.find((it): it is PFFileResponse => it.custom_key === 'tfnForm')!.value.url,
            filename: data.find((it): it is PFFileResponse => it.custom_key === 'tfnForm')!.value.name,
            mimeType: data.find((it): it is PFFileResponse => it.custom_key === 'tfnForm')!.value.type,
        },
        bankAccountName: data.find((it): it is PFTextResponse => it.custom_key === 'bankAccountName')!.value,
        bsb: data.find((it): it is PFTextResponse => it.custom_key === 'bsb')!.value,
        accountNumber: data.find((it): it is PFTextResponse => it.custom_key === 'accountNumber')!.value,
        wwcc,
        emergencyContact: {
            name: data.find((it): it is PFTextResponse => it.custom_key === 'emergencyContactName')!.value,
            mobile: data.find((it): it is PFTextResponse => it.custom_key === 'emergencyContactMobile')!.value,
            relation: data.find((it): it is PFTextResponse => it.custom_key === 'emergencyContactRelation')!.value,
        },
        pdfSummary: req.body.pdfs[PDF_KEY].url,
        status: 'generating-accounts',
    } satisfies Employee

    await DatabaseClient.updateEmployee(employee.id, employee)

    await publishToPubSub('createEmployee', {
        employeeId: employee.id,
    })

    res.sendStatus(200)
    return
})

function getState(state: string) {
    const lowercaseState = state.toLowerCase()
    if (lowercaseState.includes('vic')) return State.VIC
    if (lowercaseState.includes('new') || lowercaseState.includes('nsw')) return State.NSW
    if (lowercaseState.includes('tas')) return State.TAS
    if (lowercaseState.includes('queen') || lowercaseState.includes('qld')) return State.QLD
    if (lowercaseState.includes('act') || lowercaseState.includes('australian')) return State.ACT
    if (lowercaseState === 'nt' || lowercaseState.includes('northern')) return State.NT
    if (lowercaseState === 'sa' || lowercaseState.includes('south')) return State.SA
    if (lowercaseState.includes('western') || lowercaseState === 'wa') return State.WA
}
