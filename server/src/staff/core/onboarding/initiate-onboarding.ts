import type { Employee, InitiateEmployeeProps } from 'fizz-kidz'
import { getStudioAddress } from 'fizz-kidz'

import { ESignatureClient } from '@/esignatures.io/core/ESignaturesClient'
import { DatabaseClient } from '@/firebase/DatabaseClient'
import { FirestoreRefs } from '@/firebase/FirestoreRefs'
import { buildHostedPaperformUrl } from '@/paperforms/core/hosted-paperform-url'
import { MailClient } from '@/sendgrid/MailClient'
import { throwTrpcError } from '@/utilities'

export async function initiateOnboarding(input: InitiateEmployeeProps) {
    const employeeRef = (await FirestoreRefs.employees()).doc()

    const esignaturesClient = new ESignatureClient()
    const employeeName = `${input.firstName} ${input.lastName}`

    let contractId, contractSignUrl
    try {
        if (input.employeeRole === 'area-manager') {
            ;({ contractId, contractSignUrl } = await esignaturesClient.createAreaManagerContract({
                id: employeeRef.id,
                email: input.email,
                mobile: input.mobile,
                templateVariables: {
                    name: employeeName,
                    position: input.position,
                    commencementDate: input.commencementDate,
                    hoursPerWeek: input.hoursPerWeek,
                    annualSalary: input.annualSalary,
                },
            }))
        } else {
            ;({ contractId, contractSignUrl } = await esignaturesClient.createPartyFacilitatorContract({
                id: employeeRef.id,
                email: input.email,
                mobile: input.mobile,
                templateVariables: {
                    name: employeeName,
                    address: getStudioAddress(input.location),
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
        }
    } catch (err) {
        throwTrpcError('INTERNAL_SERVER_ERROR', 'error creating contract', err)
    }

    const employee = {
        id: employeeRef.id,
        created: new Date().getTime(),
        studio: input.studio,
        employeeRole: input.employeeRole,
        lastName: input.lastName,
        email: input.email,
        mobile: input.mobile,
        position: input.position,
        commencementDate: input.commencementDate,
        ...(input.employeeRole === 'area-manager'
            ? {
                  hoursPerWeek: input.hoursPerWeek,
                  annualSalary: input.annualSalary,
                  senderName: 'Fizz Kidz',
              }
            : {
                  location: input.location,
                  normalRate: input.normalRate,
                  sundayRate: input.sundayRate,
                  managerName: input.managerName,
                  managerPosition: input.managerPosition,
                  senderName: input.senderName,
                  senderPosition: input.senderPosition,
              }),
        firstName: input.firstName,
        status: 'form-sent',
        contract: {
            id: contractId,
            signed: false,
            signUrl: contractSignUrl,
        },
    } satisfies Employee

    await DatabaseClient.createEmployee(employee, { ref: employeeRef })

    const formUrl = buildHostedPaperformUrl('onboarding', {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        mobile: employee.mobile,
        contract: contractSignUrl,
    })

    const mailClient = await MailClient.getInstance()
    await mailClient.sendEmail(
        'onboarding',
        employee.email,
        {
            employeeName: employee.firstName,
            formUrl,
            senderName: employee.senderName,
        },
        {
            bcc: ['people@fizzkidz.com.au'],
        }
    )
}
