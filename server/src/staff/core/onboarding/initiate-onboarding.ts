import { Employee, InitiateEmployeeProps, getLocationAddress } from 'fizz-kidz'
import { FirestoreRefs } from '../../../firebase/FirestoreRefs'
import { ESignatureClient } from '../../../esignatures.io/core/ESignaturesClient'
import { throwTrpcError } from '../../../utilities'
import { DatabaseClient } from '../../../firebase/DatabaseClient'
import { MailClient } from '../../../sendgrid/MailClient'

export async function initiateOnboarding(input: InitiateEmployeeProps) {
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
                normalRate: input.normalRate,
                sundayRate: input.sundayRate,
                managerName: input.managerName,
                managerPosition: input.managerPosition,
                senderName: input.senderName,
                senderPosition: input.senderPosition,
            },
        }))
    } catch (err) {
        throwTrpcError('INTERNAL_SERVER_ERROR', 'error creating contract', err)
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
        normalRate: input.normalRate,
        sundayRate: input.sundayRate,
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

    await DatabaseClient.createEmployee(employee, { ref: employeeRef })

    const FORM_URL = 'https://fizz-kidz-onboarding.paperform.co'

    const formUrl = `${FORM_URL}?id=${employee.id}&firstName=${employee.firstName}&lastName=${
        employee.lastName
    }&email=${employee.email}&mobile=${employee.mobile}&contract=${encodeURIComponent(contractSignUrl)}`

    const mailClient = await MailClient.getInstance()
    await mailClient.sendEmail('onboarding', employee.email, {
        employeeName: employee.firstName,
        formUrl,
        senderName: employee.senderName,
    })
}
