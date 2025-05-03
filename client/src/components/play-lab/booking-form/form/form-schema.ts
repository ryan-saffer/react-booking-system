import type { Location } from 'fizz-kidz'
import { useFormContext } from 'react-hook-form'
import { z } from 'zod'

const phoneRegex = new RegExp(/^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/)

export const formSchema = z.object({
    studio: z.custom<Location>((value) => !!value, 'Please select a studio.').nullable(),
    bookingType: z.enum(['term-booking', 'casual']),
    appointmentTypeId: z.number().nullable(),
    parentFirstName: z.string().trim().min(1, 'Parent first name is required'),
    parentLastName: z.string().trim().min(1, 'Parent last name is required'),
    parentEmailAddress: z.string().email().trim().toLowerCase(),
    parentPhone: z.string().min(10, 'Number must be at least 10 digits').regex(phoneRegex, 'Invalid Number').trim(),
    // children: z.array(childSchema),
    emergencyContactName: z.string().trim().min(1, 'Emergency contact name is required'),
    emergencyContactRelation: z.string().trim().min(1, 'Emergency contact relation is required'),
    emergencyContactNumber: z
        .string()
        .min(10, 'Number must be at least 10 digits')
        .regex(phoneRegex, 'Invalid number')
        .trim(),
    pickupPeople: z.array(
        z.object({
            pickupPerson: z.string().trim().min(1, 'Pickup person cannot be empty'),
        })
    ),
    termsAndConditions: z.boolean().refine((val) => val, 'Please accept the terms and conditions'),
    joinMailingList: z.boolean(),
})

export type PlayLabBookingForm = z.infer<typeof formSchema>

export function useBookingForm() {
    return useFormContext<PlayLabBookingForm>()
}
