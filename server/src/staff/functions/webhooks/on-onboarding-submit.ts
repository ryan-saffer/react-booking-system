import { onRequest } from 'firebase-functions/v2/https'
import { logger } from 'firebase-functions/v2'
import { DatabaseClient } from '../../../firebase/DatabaseClient'
import type { Employee, OnboardingForm, PaperFormResponse, WWCC } from 'fizz-kidz'
import { getQuestionValue } from 'fizz-kidz'
import { publishToPubSub } from '../../../utilities'
import { State } from 'xero-node/dist/gen/model/payroll-au/state'

const PDF_KEY = '7843d2a'

export const onOnboardingSubmit = onRequest(async (req, res) => {
    const data = req.body.data as PaperFormResponse<OnboardingForm>

    const employeeId = getQuestionValue(data, 'id')
    const existingEmployee = await DatabaseClient.getEmployee(employeeId)

    if (existingEmployee.status !== 'form-sent') {
        logger.warn(
            `employee form already submitted for ${existingEmployee.firstName} ${existingEmployee.lastName} - exiting`
        )
        return
    }

    const wwccStatus = getQuestionValue(data, 'wwccStatus')
    let wwcc: WWCC

    if (wwccStatus === 'I have a WWCC') {
        const photo = getQuestionValue(data, 'wwccPhoto')
        wwcc = {
            status: wwccStatus,
            photo: {
                url: photo.url,
                filename: photo.name,
                mimeType: photo.type,
            },
            cardNumber: getQuestionValue(data, 'wwccCardNumber'),
        }
    } else {
        wwcc = {
            status: wwccStatus,
            applicationNumber: getQuestionValue(data, 'wwccApplicationNumber'),
        }
    }

    const employee = {
        ...existingEmployee,
        firstName: getQuestionValue(data, 'firstName'),
        lastName: getQuestionValue(data, 'lastName'),
        pronouns: getQuestionValue(data, 'pronouns'),
        dob: getQuestionValue(data, 'dob'),
        email: getQuestionValue(data, 'email'),
        mobile: getQuestionValue(data, 'mobile'),
        address: {
            full: getQuestionValue(data, 'address', 'type'),
            addressLine1: getQuestionValue(data, 'address_street', 'type'),
            city: getQuestionValue(data, 'address_suburb', 'type'),
            region: getState(getQuestionValue(data, 'address_state', 'type'))!,
            postalCode: getQuestionValue(data, 'address_postcode', 'type'),
        },
        health: getQuestionValue(data, 'health'),
        tfnForm: {
            url: getQuestionValue(data, 'tfnForm').url,
            filename: getQuestionValue(data, 'tfnForm').name,
            mimeType: getQuestionValue(data, 'tfnForm').type,
        },
        bankAccountName: getQuestionValue(data, 'bankAccountName'),
        bsb: getQuestionValue(data, 'bsb'),
        accountNumber: getQuestionValue(data, 'accountNumber'),
        wwcc,
        emergencyContact: {
            name: getQuestionValue(data, 'emergencyContactName'),
            mobile: getQuestionValue(data, 'emergencyContactMobile'),
            relation: getQuestionValue(data, 'emergencyContactRelation'),
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
