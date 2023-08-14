import { ESignatureClient } from '../../esignatures.io/core/ESignaturesClient'
import { Employee, getLocationAddress } from 'fizz-kidz'
import { getMailClient } from '../../sendgrid/MailClient'
import { logError, onCall, throwError } from '../../utilities'
import { FirestoreClient } from '../../firebase/FirestoreClient'
import { FirestoreRefs } from '../../firebase/FirestoreRefs'

export const initiateOnboarding = onCall<'initiateOnboarding'>(async (input) => {
    const employeeRef = (await FirestoreRefs.employees()).doc()

    const esignaturesClient = new ESignatureClient()

    let contractId, contractSignUrl
    try {
        ;({ contractId, contractSignUrl } = await esignaturesClient.createContract({
            id: employeeRef.id,
            email: input.email,
            mobile: input.mobile,
            templateVariables: {
                name: `${input.firstName} ${input.lastName}`,
                address: getLocationAddress(input.location),
                position: input.position,
                commencementDate: input.commencementDate,
                managerName: input.managerName,
                managerPosition: input.managerPosition,
                senderName: input.senderName,
                senderPosition: input.senderPosition,
            },
        }))
    } catch (err) {
        logError('error creating contract', err)
        throwError('internal', 'error creating contract', err)
    }

    const employee = {
        id: employeeRef.id,
        created: new Date().getTime(),
        lastName: input.lastName,
        email: input.email,
        mobile: input.mobile,
        position: input.position,
        commencementDate: input.commencementDate,
        location: input.location,
        managerName: input.managerName,
        managerPosition: input.managerPosition,
        senderName: input.senderName,
        senderPosition: input.senderPosition,
        firstName: input.firstName,
        status: 'form-sent',
        contract: {
            id: contractId,
            signed: false,
            signUrl: contractSignUrl,
        },
    } satisfies Employee

    await FirestoreClient.createEmployee(employee, { ref: employeeRef })

    const FORM_URL = 'https://fizz-kidz-onboarding.paperform.co'

    const formUrl = `${FORM_URL}?id=${employee.id}&firstName=${employee.firstName}&lastName=${
        employee.lastName
    }&email=${employee.email}&mobile=${employee.mobile}&contract=${encodeURIComponent(contractSignUrl)}`

    const mailClient = await getMailClient()
    await mailClient.sendEmail('onboarding', employee.email, {
        employeeName: employee.firstName,
        formUrl,
        senderName: employee.senderName,
    })

    return
})
