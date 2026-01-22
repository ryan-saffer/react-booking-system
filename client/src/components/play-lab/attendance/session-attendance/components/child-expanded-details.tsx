import { AcuityConstants, AcuityUtilities, type AcuityTypes } from 'fizz-kidz'

import { Badge } from '@ui-components/badge'
import { cn } from '@utils/tailwind'

export function ChildExpandedDetails({ appointment }: { appointment: AcuityTypes.Api.Appointment }) {
    const childAge = AcuityUtilities.retrieveFormAndField(
        appointment,
        AcuityConstants.Forms.CHILDREN_DETAILS,
        AcuityConstants.FormFields.CHILDREN_AGES
    )
    const isTermEnrolment =
        AcuityUtilities.retrieveFormAndField(
            appointment,
            AcuityConstants.Forms.PAYMENT,
            AcuityConstants.FormFields.IS_TERM_ENROLMENT
        ) === 'yes'
    const allergies = AcuityUtilities.retrieveFormAndField(
        appointment,
        AcuityConstants.Forms.CHILDREN_DETAILS,
        AcuityConstants.FormFields.CHILDREN_ALLERGIES
    )
    const additionalInfo = AcuityUtilities.retrieveFormAndField(
        appointment,
        AcuityConstants.Forms.CHILDREN_DETAILS,
        AcuityConstants.FormFields.CHILD_ADDITIONAL_INFO
    )
    const emergencyContactName = AcuityUtilities.retrieveFormAndField(
        appointment,
        AcuityConstants.Forms.HOLIDAY_PROGRAM_EMERGENCY_CONTACT,
        AcuityConstants.FormFields.EMERGENCY_CONTACT_NAME_HP
    )
    const emergencyContactRelation = AcuityUtilities.retrieveFormAndField(
        appointment,
        AcuityConstants.Forms.HOLIDAY_PROGRAM_EMERGENCY_CONTACT,
        AcuityConstants.FormFields.EMERGENCY_CONTACT_RELATION_HP
    )
    const emergencyContactNumber = AcuityUtilities.retrieveFormAndField(
        appointment,
        AcuityConstants.Forms.HOLIDAY_PROGRAM_EMERGENCY_CONTACT,
        AcuityConstants.FormFields.EMERGENCY_CONTACT_NUMBER_HP
    )

    const rows: { title: string; value: string; className?: string }[] = [
        ...(additionalInfo && [
            {
                title: 'Additional Information:',
                value: additionalInfo,
                className: 'bg-blue-100 hover:bg-blue-200/60 shadow-[inset_4px_0_0_0_theme(colors.blue.400)]',
            },
        ]),
        ...(allergies && [
            {
                title: 'Child Allergies:',
                value: allergies,
                className:
                    'bg-red-100 shadow-[inset_4px_0_0_0_theme(colors.orange.400)] border-t-1 hover:bg-orange-200/60',
            },
        ]),
        { title: 'Child age:', value: childAge, className: 'sm:hidden' },
        {
            title: 'Booking Type:',
            value: isTermEnrolment ? (
                <Badge>Term Enrolment</Badge>
            ) : (
                <Badge variant="outline" className="bg-white">
                    Casual
                </Badge>
            ),
            className: 'sm:hidden',
        },
        { title: 'Parent name:', value: `${appointment.firstName} ${appointment.lastName}` },
        {
            title: 'Parent Phone:',
            value: (
                <a href={`tel:${appointment.phone}`} className="text-blue-500 underline">
                    {appointment.phone}
                </a>
            ),
        },
        { title: 'Parent Email:', value: appointment.email },
        { title: 'Emergency Contact Name:', value: emergencyContactName },
        { title: 'Emergency Contact Relation:', value: emergencyContactRelation },
        {
            title: 'Emergency Contact Phone:',
            value: (
                <a href={`tel:${emergencyContactNumber}`} className="text-blue-500 underline">
                    {emergencyContactNumber}
                </a>
            ),
        },
    ]

    return (
        <div className="flex flex-col">
            {rows.map((row, idx) => (
                <div
                    key={idx}
                    className={cn('flex border-t bg-slate-100 first:border-t-0 hover:bg-slate-200/50', row.className)}
                >
                    <p className="w-1/2 max-w-full border-r p-4 font-semibold sm:ml-12 sm:max-w-60">{row.title}</p>
                    <div className="w-1/2 min-w-14 text-wrap p-4">{row.value}</div>
                </div>
            ))}
        </div>
    )
}
