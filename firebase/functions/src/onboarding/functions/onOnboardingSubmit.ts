import * as functions from 'firebase-functions'
import { FirestoreClient } from '../../firebase/FirestoreClient'
import { getDriveClient } from '../../drive/DriveClient'
import { getXeroClient } from '../../xero/XeroClient'
import { Employee } from 'fizz-kidz'
import { Employee as XeroEmployee } from 'xero-node/dist/gen/model/payroll-au/employee'
import { State } from 'xero-node/dist/gen/model/payroll-au/state'
import { EmploymentType } from 'xero-node/dist/gen/model/payroll-au/employmentType'
import { IncomeType } from 'xero-node/dist/gen/model/payroll-au/incomeType'
import { EmploymentBasis } from 'xero-node/dist/gen/model/payroll-au/employmentBasis'
import { env } from '../../init'
import { EarningsRateCalculationType } from 'xero-node/dist/gen/model/payroll-au/earningsRateCalculationType'
import { SlingClient } from '../../sling/core/slingClient'

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

const CURRENT_STAFF_FOLDER_ID = '19pzxRIbp3jzM7HJAUMg6Bau5B_y5xjwt'
const STAFF_ORDINARY_HOURS_RATE_ID =
    env === 'prod' ? '1ef5805a-5208-4d89-8f35-620104543ed4' : '4b2bb657-a2be-40ff-a13d-3aeee69d34ce'
const PAYROLL_CALENDAR_ID =
    env === 'prod' ? '76728c47-3451-42e7-93cc-d99fad85d4c2' : 'c44ebff9-c5ec-41de-9e13-0e55f6e11b2d'

export const onOnboardingSubmit = functions.region('australia-southeast1').https.onRequest(async (req, res) => {
    console.log('*** STARTING ***')
    res.sendStatus(200)

    const PDF_KEY = '7843d2a'

    const data = req.body.data as PFResponse[]

    const employeeId = data.find((it): it is PFTextResponse => it.custom_key === 'id')!.value
    let employee = (await FirestoreClient.getEmployee(employeeId)) as Required<Employee>

    if (employee.status !== 'form-sent') {
        functions.logger.log(`employee form already submitted for ${employee.firstName} ${employee.lastName} - exiting`)
        return
    }

    const wwccPhoto = data.find((it): it is PFFileResponse => it.custom_key === 'wwccPhoto')?.value

    employee = {
        ...employee,
        firstName: data.find((it): it is PFTextResponse => it.custom_key === 'firstName')!.value,
        lastName: data.find((it): it is PFTextResponse => it.custom_key === 'lastName')!.value,
        pronouns: data.find((it): it is PFTextResponse => it.custom_key === 'pronouns')!.value,
        dob: data.find((it): it is PFTextResponse => it.custom_key === 'dob')!.value,
        email: data.find((it): it is PFTextResponse => it.custom_key === 'email')!.value,
        mobile: data.find((it): it is PFTextResponse => it.custom_key === 'mobile')!.value,
        address: data.find((it): it is PFTextResponse => it.custom_key === 'address')!.value,
        health: data.find((it): it is PFTextResponse => it.custom_key === 'health')!.value,
        tfnForm: {
            url: data.find((it): it is PFFileResponse => it.custom_key === 'tfnForm')!.value.url,
            filename: data.find((it): it is PFFileResponse => it.custom_key === 'tfnForm')!.value.name,
            mimeType: data.find((it): it is PFFileResponse => it.custom_key === 'tfnForm')!.value.type,
        },
        bankAccountName: data.find((it): it is PFTextResponse => it.custom_key === 'bankAccountName')!.value,
        bsb: data.find((it): it is PFTextResponse => it.custom_key === 'bsb')!.value,
        accountNumber: data.find((it): it is PFTextResponse => it.custom_key === 'accountNumber')!.value,
        wwccStatus: data.find((it): it is PFTextResponse => it.custom_key === 'wwccStatus')!.value,
        ...(wwccPhoto && {
            wwccPhoto: {
                url: data.find((it): it is PFFileResponse => it.custom_key === 'wwccPhoto')!.value.url,
                filename: data.find((it): it is PFFileResponse => it.custom_key === 'wwccPhoto')!.value.name,
                mimeType: data.find((it): it is PFFileResponse => it.custom_key === 'wwccPhoto')!.value.type,
            },
        }),
        wwccCardNumber: data.find((it): it is PFTextResponse => it.custom_key === 'wwccCardNumber')!.value,
        wwccApplicationNumber: data.find((it): it is PFTextResponse => it.custom_key === 'wwccApplicationNumber')!
            .value,
        emergencyContactName: data.find((it): it is PFTextResponse => it.custom_key === 'emergencyContactName')!.value,
        emergencyContactMobile: data.find((it): it is PFTextResponse => it.custom_key === 'emergencyContactMobile')!
            .value,
        emergencyContactRelation: data.find((it): it is PFTextResponse => it.custom_key === 'emergencyContactRelation')!
            .value,
        pdfSummary: req.body.pdfs[PDF_KEY].url,
        status: 'generating-accounts',
    }

    await FirestoreClient.updateEmployee(employee)

    console.log(employee)

    // create google drive folder
    const driveClient = getDriveClient()
    try {
        const folderId = await driveClient.createFolder(
            `${employee.firstName} ${employee.lastName}`,
            CURRENT_STAFF_FOLDER_ID
        )

        // TFN form
        await driveClient.uploadFileFromUrl(
            employee.tfnForm.url,
            employee.tfnForm.filename,
            employee.tfnForm.mimeType,
            folderId!
        )

        // WWCC
        if (employee.wwccPhoto) {
            const { url, mimeType } = employee.wwccPhoto
            await driveClient.uploadFileFromUrl(
                url,
                `WWCC - ${employee.firstName} ${employee.lastName}`,
                mimeType,
                folderId!
            )
        }

        // PDF summary
        await driveClient.uploadFileFromUrl(
            employee.pdfSummary,
            `${employee.firstName} ${employee.lastName} Onboarding Form`,
            'application/pdf',
            folderId!
        )
    } catch (err) {
        functions.logger.error('error creating employee folder and uploading files', { details: err })
        throw new functions.https.HttpsError('internal', 'unable to create employee folder', { details: err })
    }

    // create user in xero
    const xeroClient = await getXeroClient()
    // THINGS NEEDED TO BE MANUAL
    // - Invite to 'Xero Me'
    // - Emergency Contact
    // - Holiday Group
    // - Tax declaration
    // - Super (Include adding it to pay template)
    let employeeXeroId: string
    try {
        const createEmployeeResult = await xeroClient.payrollAUApi.createEmployee('', [
            {
                firstName: employee.firstName,
                lastName: employee.lastName,
                dateOfBirth: employee.dob,
                email: employee.email,
                mobile: employee.mobile,
                gender: getGenderEnum(employee.pronouns),
                homeAddress: {
                    addressLine1: data.find((it): it is PFTextResponse => it.type === 'address_street')!.value,
                    city: data.find((it): it is PFTextResponse => it.type === 'address_suburb')!.value,
                    region: getState(data.find((it): it is PFTextResponse => it.type === 'address_state')!.value),
                    postalCode: data.find((it): it is PFTextResponse => it.type === 'address_postcode')!.value,
                },
                startDate: employee.commencementDate,
                payrollCalendarID: PAYROLL_CALENDAR_ID,

                employmentType: EmploymentType.EMPLOYEE,
                incomeType: IncomeType.SALARYANDWAGES,
                ordinaryEarningsRateID: STAFF_ORDINARY_HOURS_RATE_ID,
                taxDeclaration: {
                    employmentBasis: EmploymentBasis.CASUAL,
                },
                bankAccounts: [
                    {
                        statementText: 'Fizz Kidz Wages',
                        accountName: employee.bankAccountName,
                        bSB: employee.bsb,
                        accountNumber: employee.accountNumber,
                        remainder: true,
                    },
                ],
                payTemplate: {
                    earningsLines: [
                        {
                            earningsRateID: STAFF_ORDINARY_HOURS_RATE_ID,
                            ratePerUnit: employee.baseWage,
                            calculationType: EarningsRateCalculationType.ENTEREARNINGSRATE,
                        },
                    ],
                },
            },
        ])
        employeeXeroId = createEmployeeResult.body.employees![0].employeeID!
    } catch (err) {
        functions.logger.error(`error creating employee in xero: ${employee.firstName} ${employee.lastName}`, {
            details: err,
        })
        throw new functions.https.HttpsError(
            'internal',
            `error creating employee in xero: ${employee.firstName} ${employee.lastName}`,
            { details: err }
        )
    }

    console.log('XERO ID', employeeXeroId)

    // create employee in sling
    const slingClient = new SlingClient()
    try {
        await slingClient.createUser({
            name: employee.firstName,
            legalName: employee.firstName,
            lastname: employee.lastName,
            email: employee.email,
            countryCode: '+61',
            countryISOCode: 'AU',
            phone: employee.mobile,
            timezone: 'Australia/Melbourne',
            role: 'user',
            employeeId: employeeXeroId,
            accessToLaborCost: false,
            timeclockEnabled: true,
            invite: false,
            groups: [
                { id: 4809521 }, // balwyn
                { id: 11315826 }, // cheltenham
                { id: 4895739 }, // essendon
                { id: 4809537 }, // malvern
                { id: 5557282 }, // mobile
                { id: 4809533 }, // party fac
                { id: 5557194 }, // hol program fac
                { id: 5206290 }, // science club fac
                { id: 13464907 }, // on call
                { id: 13464921 }, // called in party fac
                { id: 13464944 }, // called in hol program fac
                { id: 6161155 }, // miscellaneous
                { id: 4809520 }, // everyone
            ],
        })
    } catch (err) {
        functions.logger.error(`error creating employee in sling: ${employee.firstName} ${employee.lastName}`)
        throw new functions.https.HttpsError(
            'internal',
            `error creating employee in sling: ${employee.firstName} ${employee.lastName}`
        )
    }

    await FirestoreClient.updateEmployee({ id: employee.id, xeroUserId: employeeXeroId, status: 'verification' })

    console.log('*** FINISHED ***')
})

function getGenderEnum(pronouns: string) {
    if (pronouns === 'He/Him') {
        return XeroEmployee.GenderEnum.M
    }
    if (pronouns === 'She/Her') {
        return XeroEmployee.GenderEnum.F
    }
    if (pronouns === 'They/Them') {
        return XeroEmployee.GenderEnum.I
    }
}

function getState(state: string) {
    const lowercaseState = state.toLowerCase()
    if (lowercaseState.includes('vic')) return State.VIC
    if (lowercaseState.includes('new') || lowercaseState.includes('nsw')) return State.NSW
    if (lowercaseState.includes('tas')) return State.TAS
    if (lowercaseState.includes('queen') || lowercaseState.includes('qld')) return State.QLD
    if (lowercaseState.includes('act') || lowercaseState.includes('australian')) return State.ACT
    if (lowercaseState.includes('nt') || lowercaseState.includes('northern')) return State.NT
    if (lowercaseState === 'sa' || lowercaseState.includes('south')) return State.SA
    if (lowercaseState.includes('western') || lowercaseState.includes('wa')) return State.WA
}
