import { format } from 'date-fns'

import type { AcuityTypes } from 'fizz-kidz'

import { Badge } from '@ui-components/badge'
import { cn } from '@utils/tailwind'

import type { LittleLearnersAttendanceEnrolment } from '../utils/get-enrolment'

export function ChildExpandedDetails({
    appointment,
    enrolment,
}: {
    appointment: AcuityTypes.Api.Appointment
    enrolment: LittleLearnersAttendanceEnrolment
}) {
    const maybeSignature = enrolment.signatures[appointment.id]
    const signature = typeof maybeSignature === 'string' ? null : maybeSignature

    const rows: { title: string; value: React.ReactNode; className?: string }[] = [
        ...(enrolment.child.additionalInfo
            ? [
                  {
                      title: 'Additional Information:',
                      value: enrolment.child.additionalInfo,
                      className: 'bg-blue-100 hover:bg-blue-200/60 shadow-[inset_4px_0_0_0_theme(colors.blue.400)]',
                  },
              ]
            : []),
        ...(enrolment.child.allergies
            ? [
                  {
                      title: 'Allergies:',
                      value: enrolment.child.allergies,
                      className:
                          'bg-red-100 shadow-[inset_4px_0_0_0_theme(colors.orange.400)] border-t-1 hover:bg-orange-200/60',
                  },
              ]
            : []),
        {
            title: 'Date of Birth:',
            value: format(new Date(enrolment.child.dob), 'PPP'),
            className: 'sm:hidden',
        },
        {
            title: 'Program Type:',
            value: <Badge>Term Enrolment</Badge>,
            className: 'sm:hidden',
        },
        { title: 'Parent Name:', value: `${enrolment.parent.firstName} ${enrolment.parent.lastName}` },
        {
            title: 'Parent Phone:',
            value: (
                <a href={`tel:${enrolment.parent.phone}`} className="text-blue-500 underline">
                    {enrolment.parent.phone}
                </a>
            ),
        },
        { title: 'Parent Email:', value: enrolment.parent.email },
        { title: 'Emergency Contact Name:', value: enrolment.emergencyContact.name },
        { title: 'Emergency Contact Relation:', value: enrolment.emergencyContact.relation },
        {
            title: 'Emergency Contact Phone:',
            value: (
                <a href={`tel:${enrolment.emergencyContact.phone}`} className="text-blue-500 underline">
                    {enrolment.emergencyContact.phone}
                </a>
            ),
        },
        ...(signature
            ? [
                  { title: 'Signed Out By:', value: signature.pickupPerson },
                  { title: 'Signed Out At:', value: format(new Date(signature.timestamp), 'PPP p') },
                  ...(signature.staffReason ? [{ title: 'Staff Reason:', value: signature.staffReason }] : []),
              ]
            : []),
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
