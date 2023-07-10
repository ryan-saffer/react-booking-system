import { WithoutId } from 'fizz-kidz/src/utilities'
import * as functions from 'firebase-functions'
import { ESignatureClient } from '../../esignatures.io/core/ESignaturesClient'
import { Employee, getLocationAddress } from 'fizz-kidz'
import { FirestoreClient } from '../../firebase/FirestoreClient'
import { getMailClient } from '../../sendgrid/MailClient'
import { onCall } from '../../utilities'

export const initiateOnboarding = onCall<'initiateOnboarding'>(async (input) => {
    const {
        firstName,
        lastName,
        email,
        mobile,
        baseWage,
        position,
        commencementDate,
        location,
        managerName,
        managerPosition,
        senderName,
        senderPosition,
    } = input

    const employee = {
        created: new Date().getTime(),
        firstName,
        lastName,
        email,
        mobile,
        baseWage,
        position,
        commencementDate,
        location,
        managerName,
        managerPosition,
        senderName,
        senderPosition,
        status: 'form-sent',
        contractSigned: false,
    } satisfies WithoutId<Employee>

    const id = await FirestoreClient.createEmployee(employee)

    const esignaturesClient = new ESignatureClient()

    let contractUrl
    try {
        contractUrl = await esignaturesClient.createContract({
            id,
            email: 'ryansaffer@gmail.com',
            mobile: '+61413892120',
            templateVariables: {
                name: `${firstName} ${lastName}`,
                address: getLocationAddress(location),
                position,
                saturdayWage: (baseWage * 1.25).toString(),
                sundayWage: (baseWage * 1.75).toString(),
                commencementDate,
                managerName,
                managerPosition,
                senderName,
                senderPosition,
            },
        })
    } catch (err) {
        functions.logger.error('error creating contract', { details: err })
        await FirestoreClient.deleteEmployee(id)
        throw new functions.https.HttpsError('internal', 'error creating contract', err)
    }

    await FirestoreClient.updateEmployee({ id, contractUrl })

    const FORM_URL = 'https://fizz-kidz-onboarding.paperform.co'

    const formUrl = `${FORM_URL}?id=${id}&firstName=${firstName}&lastName=${lastName}&email=${email}&mobile=${mobile}&contract=${encodeURIComponent(
        contractUrl
    )}`

    const mailClient = getMailClient()
    await mailClient.sendEmail('onboarding', email, { employeeName: firstName, formUrl, senderName })

    return
})
