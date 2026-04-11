import { useFormContext } from 'react-hook-form'
import { z } from 'zod'

import type { DefaultValues } from 'react-hook-form'

const phoneRegex = new RegExp(/^([+]?\s*[0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?\s?[0-9])+$/)

const childSchema = z
    .object({
        firstName: z.string().trim().min(1, 'Child first name is required'),
        lastName: z.string().trim().min(1, 'Child last name is required'),
        dob: z
            .date()
            .optional()
            .refine((date) => !!date, 'Date of birth is required'),
        hasAllergies: z
            .boolean()
            .optional()
            .refine((value) => value !== undefined, 'Select if the child has any allergies.'),
        allergies: z.string().optional(),
        additionalInfo: z.string().optional(),
    })
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
    parentFirstName: z.string().trim().min(1, 'Parent first name is required'),
    parentLastName: z.string().trim().min(1, 'Parent last name is required'),
    parentEmailAddress: z.string().email().trim().toLowerCase(),
    parentPhone: z.string().min(10, 'Number must be at least 10 digits').regex(phoneRegex, 'Invalid number').trim(),
    children: z.array(childSchema).min(1, 'At least one child is required'),
    emergencyContactName: z.string().trim().min(1, 'Emergency contact name is required'),
    emergencyContactRelation: z.string().trim().min(1, 'Emergency contact relation is required'),
    emergencyContactNumber: z
        .string()
        .min(10, 'Number must be at least 10 digits')
        .regex(phoneRegex, 'Invalid number')
        .trim(),
    termsAndConditions: z.boolean().refine((value) => value, 'Please confirm before submitting'),
    joinMailingList: z.boolean(),
})

export type LittleLearnersForm = z.infer<typeof formSchema>

export const defaultValues: DefaultValues<LittleLearnersForm> = {
    parentFirstName: '',
    parentLastName: '',
    parentEmailAddress: '',
    parentPhone: '',
    children: [
        {
            firstName: '',
            lastName: '',
            dob: undefined,
            hasAllergies: undefined,
            allergies: undefined,
            additionalInfo: undefined,
        },
    ],
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactNumber: '',
    termsAndConditions: false,
    joinMailingList: true,
}

export function useLittleLearnersForm() {
    return useFormContext<LittleLearnersForm>()
}
