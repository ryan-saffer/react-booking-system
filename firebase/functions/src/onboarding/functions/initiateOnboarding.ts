import { WithoutId } from 'fizz-kidz/src/utilities'
import * as functions from 'firebase-functions'
import { ESignatureClient } from '../../esignatures.io/core/ESignaturesClient'
import { Employee, Locations, getLocationAddress } from 'fizz-kidz'
import { FirestoreClient } from '../../firebase/FirestoreClient'
import { getMailClient } from '../../sendgrid/MailClient'

export const initiateOnboarding = functions.region('australia-southeast1').https.onRequest(async (req, res) => {
    console.log('*** Running my server! ***')

    const employee = {
        created: new Date().getTime(),
        firstName: 'Ryan',
        lastName: 'Saffer',
        email: 'ryansaffer@gmail.com',
        mobile: '0413892120',
        baseWage: '19.25',
        saturdayRate: '24.78',
        commencementDate: '2023-05-23',
        location: Locations.MALVERN,

        managerName: 'Bonnie Rowe',
        managerPosition: 'Malvern Studio Manager',
        senderName: 'Bonnie Chuy',
        senderPosition: 'COO',
        status: 'form-sent',
        contractSigned: false,
    } satisfies WithoutId<Employee>

    const {
        firstName,
        lastName,
        email,
        mobile,
        location,
        saturdayRate,
        commencementDate,
        managerName,
        managerPosition,
        senderName,
        senderPosition,
    } = employee

    const id = await FirestoreClient.createEmployee(employee)

    const esignaturesClient = new ESignatureClient()

    let contractUrl
    try {
        contractUrl = await esignaturesClient.sendContract({
            email: 'ryansaffer@gmail.com',
            mobile: '+61413892120',
            templateVariables: {
                name: `${firstName} ${lastName}`,
                address: getLocationAddress(location),
                position: 'Party Facilitator',
                wage: saturdayRate,
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

    res.sendStatus(200)
    console.log('*** FINISHED ***')
})
