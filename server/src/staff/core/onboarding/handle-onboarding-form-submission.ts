import { logger } from 'firebase-functions/v2'
import { drive } from 'googleapis/build/src/apis/drive'
import { State } from 'xero-node/dist/gen/model/payroll-au/state'

import type { Employee, OnboardingForm, PaperFormResponse, WWCC } from 'fizz-kidz'
import { getQuestionValue } from 'fizz-kidz'

import { DatabaseClient } from '@/firebase/DatabaseClient'
import { DriveClient } from '@/google/DriveClient'
import { MailClient } from '@/sendgrid/MailClient'
import { logError } from '@/utilities'

const CURRENT_STAFF_FOLDER_ID = '11CgIoNzfcAcvY2ciz65LPsc3Jw_xjKba'
// const STAFF_ORDINARY_HOURS_RATE_ID =
//     env === 'prod' ? '1ef5805a-5208-4d89-8f35-620104543ed4' : '4b2bb657-a2be-40ff-a13d-3aeee69d34ce'
// const PAYROLL_CALENDAR_ID =
//     env === 'prod' ? '76728c47-3451-42e7-93cc-d99fad85d4c2' : 'c44ebff9-c5ec-41de-9e13-0e55f6e11b2d'

export async function handleOnboardingFormSubmission(data: PaperFormResponse<OnboardingForm>, pdfUrl: string) {
    const employeeId = getQuestionValue(data, 'id')
    const existingEmployee = await DatabaseClient.getEmployee(employeeId)

    if (existingEmployee.status !== 'form-sent') {
        logger.log(
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
        pdfSummary: pdfUrl,
        status: 'generating-accounts',
    } satisfies Employee

    await DatabaseClient.updateEmployee(employee.id, employee)

    // create google drive folder
    const driveClient = await DriveClient.getInstance()
    let folderId: string | null | undefined = null
    try {
        folderId = await driveClient.createFolder(`${employee.firstName} ${employee.lastName}`, CURRENT_STAFF_FOLDER_ID)

        // TFN form
        if (employee.tfnForm) {
            await driveClient.uploadFileFromUrl(
                employee.tfnForm.url,
                `TFN & Super Declaration - ${employee.firstName} ${employee.lastName}`,
                employee.tfnForm.mimeType,
                folderId!
            )
        }

        // WWCC
        if (employee.wwcc.status === 'I have a WWCC') {
            const { url, mimeType } = employee.wwcc.photo
            await driveClient.uploadFileFromUrl(
                url,
                `WWCC - ${employee.firstName} ${employee.lastName}`,
                mimeType,
                folderId!
            )
        }

        // CPR / First Aid / Food Safety
        const cprFirstAid = getQuestionValue(data, 'cprFirstAid')
        if (cprFirstAid) {
            await driveClient.uploadFileFromUrl(
                cprFirstAid.url,
                `CPR / First Aid Certificate - ${employee.firstName} ${employee.lastName}`,
                cprFirstAid.type,
                folderId!
            )
        }

        const foodSafety = getQuestionValue(data, 'foodSafety')
        if (foodSafety) {
            await driveClient.uploadFileFromUrl(
                foodSafety.url,
                `Food Safety Certificate - ${employee.firstName} ${employee.lastName}`,
                foodSafety.type,
                folderId!
            )
        }

        // PDF summary
        if (employee.pdfSummary) {
            await driveClient.uploadFileFromUrl(
                employee.pdfSummary,
                `${employee.firstName} ${employee.lastName} Onboarding Form`,
                'application/pdf',
                folderId!
            )
        }

        // Contract
        if (employee.contract.signed) {
            await driveClient.uploadFileFromUrl(
                employee.contract.signedUrl,
                `${employee.firstName} ${employee.lastName} Signed Contract`,
                'application/pdf',
                folderId!
            )
        }
    } catch (err) {
        logError('error creating employee folder and uploading files', err)
        return
    }

    /**
     * We used to create the employee in Xero and Sling, but decided its too complex.
     * It is still all done manually, but code left here as we may still do this once we franchise... maybe..
     */

    // // create user in xero
    // const xeroClient = await XeroClient.getInstance()
    // let employeeXeroId: string
    // try {
    //     const createEmployeeResult = await xeroClient.payrollAUApi.createEmployee('', [
    //         {
    //             firstName: employee.firstName,
    //             lastName: employee.lastName,
    //             dateOfBirth: employee.dob,
    //             email: employee.email,
    //             mobile: employee.mobile,
    //             gender: getGenderEnum(employee.pronouns),
    //             homeAddress: {
    //                 addressLine1: employee.address.addressLine1,
    //                 city: employee.address.city,
    //                 region: employee.address.region,
    //                 postalCode: employee.address.postalCode,
    //             },
    //             startDate: employee.commencementDate,
    //             payrollCalendarID: PAYROLL_CALENDAR_ID,

    //             employmentType: EmploymentType.EMPLOYEE,
    //             incomeType: IncomeType.SALARYANDWAGES,
    //             ordinaryEarningsRateID: STAFF_ORDINARY_HOURS_RATE_ID,
    //             taxDeclaration: {
    //                 employmentBasis: EmploymentBasis.CASUAL,
    //             },
    //             bankAccounts: [
    //                 {
    //                     statementText: 'Fizz Kidz Wages',
    //                     accountName: employee.bankAccountName,
    //                     bSB: employee.bsb,
    //                     accountNumber: employee.accountNumber,
    //                     remainder: true,
    //                 },
    //             ],
    //             payTemplate: {
    //                 earningsLines: [
    //                     {
    //                         earningsRateID: STAFF_ORDINARY_HOURS_RATE_ID,
    //                         ratePerUnit: 0,
    //                         calculationType: EarningsRateCalculationType.ENTEREARNINGSRATE,
    //                     },
    //                 ],
    //             },
    //         },
    //     ])
    //     employeeXeroId = createEmployeeResult.body.employees![0].employeeID!
    // } catch (err) {
    //     logError(`error creating employee in xero: ${employee.firstName} ${employee.lastName}`, err)
    //     return
    // }

    // // create employee in sling
    // const slingClient = new SlingClient()
    // try {
    //     await slingClient.createUser({
    //         name: employee.firstName,
    //         legalName: employee.firstName,
    //         lastname: employee.lastName,
    //         email: employee.email,
    //         countryCode: '+61',
    //         countryISOCode: 'AU',
    //         phone: employee.mobile,
    //         timezone: 'Australia/Melbourne',
    //         role: 'user',
    //         employeeId: employeeXeroId,
    //         accessToLaborCost: false,
    //         timeclockEnabled: true,
    //         invite: false,
    //         groups: [
    //             { id: 4809521 }, // balwyn
    //             { id: 11315826 }, // cheltenham
    //             { id: 4895739 }, // essendon
    //             { id: 4809537 }, // malvern
    //             { id: 5557282 }, // mobile
    //             { id: 4809533 }, // party fac
    //             { id: 5557194 }, // hol program fac
    //             { id: 5206290 }, // science club fac
    //             { id: 13464907 }, // on call
    //             { id: 13464921 }, // called in party fac
    //             { id: 13464944 }, // called in hol program fac
    //             { id: 6161155 }, // miscellaneous
    //             { id: 4809520 }, // everyone
    //         ],
    //     })
    // } catch (err) {
    //     logError(`error creating employee in sling: ${employee.firstName} ${employee.lastName}`)
    //     return
    // }

    await DatabaseClient.updateEmployee(employee.id, {
        // xeroUserId: employeeXeroId,
        driveFolderId: folderId!,
        status: 'verification',
    })

    // notify people@fizzkidz that the employee has filled in their form.
    const mailClient = await MailClient.getInstance()
    await mailClient.sendEmail('onboardingFormCompletedNotification', 'people@fizzkidz.com.au', {
        employeeName: `${employee.firstName} ${employee.lastName}`,
    })

    return
}

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

// function getGenderEnum(pronouns: string) {
//     if (pronouns === 'He/Him') {
//         return XeroEmployee.GenderEnum.M
//     }
//     if (pronouns === 'She/Her') {
//         return XeroEmployee.GenderEnum.F
//     }
//     if (pronouns === 'They/Them') {
//         return XeroEmployee.GenderEnum.I
//     }
// }
