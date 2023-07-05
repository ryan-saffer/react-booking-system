import * as functions from 'firebase-functions'
import { FirestoreClient } from '../../firebase/FirestoreClient'
import { getDriveClient } from '../../drive/DriveClient'

type BasePFResponse = {
    custom_key: string
}

type PFFileResponse = BasePFResponse & {
    type: 'file'
    value: { url: string; name: string; type: string }
}

type PFTextResponse = BasePFResponse & {
    type: 'text' | 'id'
    value: string
}

type PFResponse = PFFileResponse | PFTextResponse

const CURRENT_STAFF_FOLDER_ID = '19pzxRIbp3jzM7HJAUMg6Bau5B_y5xjwt'

export const onOnboardingSubmit = functions.region('australia-southeast1').https.onRequest(async (req, res) => {
    console.log('*** STARTING ***')

    const PDF_KEY = '7843d2a'

    const data = req.body.data as PFResponse[]

    const employeeId = data.find((it): it is PFTextResponse => it.custom_key === 'id')!.value
    let employee = await FirestoreClient.getEmployee(employeeId)

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
        wwccPhoto: {
            url: data.find((it): it is PFFileResponse => it.custom_key === 'wwccPhoto')!.value.url,
            filename: data.find((it): it is PFFileResponse => it.custom_key === 'wwccPhoto')!.value.name,
            mimeType: data.find((it): it is PFFileResponse => it.custom_key === 'wwccPhoto')!.value.type,
        },
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

    const driveClient = getDriveClient()
    try {
        const folderId = await driveClient.createFolder(
            `${employee.firstName} ${employee.lastName}`,
            CURRENT_STAFF_FOLDER_ID
        )

        // TFN form
        await driveClient.uploadFileFromUrl(
            employee.tfnForm!.url,
            employee.tfnForm!.filename,
            employee.tfnForm!.mimeType,
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
            employee.pdfSummary!,
            `${employee.firstName} ${employee.lastName} Onboarding Form`,
            'application/pdf',
            folderId!
        )
    } catch (err) {
        functions.logger.error('error creating employee folder and uploading files', { details: err })
        throw new functions.https.HttpsError('internal', 'unable to create employee folder', { details: err })
    }

    res.sendStatus(200)
    console.log('*** FINISHED ***')
})
