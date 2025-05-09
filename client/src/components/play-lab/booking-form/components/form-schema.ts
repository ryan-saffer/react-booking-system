import type { Location } from 'fizz-kidz'
import { DateTime } from 'luxon'
import { useFormContext } from 'react-hook-form'
import { z } from 'zod'

const phoneRegex = new RegExp(/^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/)

const childSchema = z
    .object({
        // All fields here are optional to allow appending an empty child (see https://github.com/orgs/react-hook-form/discussions/10211)
        // By using `refine()` on each optional field, we still enforce that they have a value.
        firstName: z.string().trim().min(1, 'Child first name is required'),
        lastName: z.string().trim().min(1, 'Child last name is required'),
        dob: z.date({ required_error: 'Date of birth is required', invalid_type_error: 'Invalid date' }).refine(
            (date) => {
                const now = DateTime.now()
                const ageInMonths = now.diff(DateTime.fromJSDate(date), 'months').months
                return ageInMonths >= 18 && ageInMonths <= 84
            },
            {
                message: 'Child age must be between 18 months and 6 years old',
            }
        ),
        hasAllergies: z
            .boolean()
            .optional()
            .refine((val) => val !== undefined, 'Select if the child has any allergies.'),
        allergies: z.string().optional(),
        additionalInfo: z.string().optional(),
    })
    // only require `allergies` if `hasAllergies` is true
    .refine(
        (data) => {
            if (data.hasAllergies && !data.allergies) {
                return false
            }
            return true
        },
        {
            message: `Please enter the child's allergies`,
            path: ['allergies'],
        }
    )

export const formSchema = z.object({
    studio: z.custom<Location>((value) => !!value, 'Please select a studio.').nullable(),
    bookingType: z.enum(['term-booking', 'casual']).nullable(),
    appointmentTypeId: z.number().nullable(),
    parentFirstName: z.string().trim().min(1, 'Parent first name is required'),
    parentLastName: z.string().trim().min(1, 'Parent last name is required'),
    parentEmailAddress: z.string().email().trim().toLowerCase(),
    parentPhone: z.string().min(10, 'Number must be at least 10 digits').regex(phoneRegex, 'Invalid Number').trim(),
    children: z.array(childSchema),
    emergencyContactName: z.string().trim().min(1, 'Emergency contact name is required'),
    emergencyContactRelation: z.string().trim().min(1, 'Emergency contact relation is required'),
    emergencyContactNumber: z
        .string()
        .min(10, 'Number must be at least 10 digits')
        .regex(phoneRegex, 'Invalid number')
        .trim(),
    termsAndConditions: z.boolean().refine((val) => val, 'Please accept the terms and conditions'),
    joinMailingList: z.boolean(),
})

export type PlayLabBookingForm = z.infer<typeof formSchema>

export function useBookingForm() {
    return useFormContext<PlayLabBookingForm>()
}
