import { useFormContext } from 'react-hook-form'
import { z } from 'zod'

import type { StudioOrTest } from 'fizz-kidz'

const phoneRegex = new RegExp(/^([+]?\s*[0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?\s?[0-9])+$/)

const childSchema = z
    .object({
        firstName: z.string().trim().min(1, 'Child first name is required'),
        lastName: z.string().trim().min(1, 'Child last name is required'),
        dob: z.date({ required_error: 'Date of birth is required', invalid_type_error: 'Date of birth is required' }),
        hasAllergies: z
            .union([z.boolean(), z.null()])
            .refine((value) => value !== null, 'Select if the child has any allergies.'),
        allergies: z.string().optional(),
        isAnaphylactic: z.union([z.boolean(), z.null()]),
        anaphylaxisPlan: z
            .object({
                fileName: z.string(),
                storagePath: z.string(),
            })
            .optional(),
        additionalInfo: z.string().optional(),
    })
    .refine(
        (data) => {
            if (data.hasAllergies && !data.allergies) return false
            return true
        },
        {
            message: `Please enter the child's allergies`,
            path: ['allergies'],
        }
    )
    .refine(
        (data) => {
            if (data.hasAllergies && data.isAnaphylactic === null) return false
            return true
        },
        {
            message: 'Select if the child is anaphylactic.',
            path: ['isAnaphylactic'],
        }
    )
    .refine(
        (data) => {
            if (data.isAnaphylactic && !data.anaphylaxisPlan) return false
            return true
        },
        {
            message: 'Please upload an anaphylaxis plan.',
            path: ['anaphylaxisPlan'],
        }
    )

export const formSchema = z.object({
    studio: z.custom<StudioOrTest>((value) => !!value, 'Please select a studio.').nullable(),
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
    termsAndConditions: z.boolean().refine((value) => value, 'Please confirm before continuing'),
    joinMailingList: z.boolean(),
})

type AnaphylaxisPlan = {
    fileName: string
    storagePath: string
}

type ChildForm = Omit<z.infer<typeof childSchema>, 'hasAllergies' | 'isAnaphylactic' | 'anaphylaxisPlan'> & {
    hasAllergies: boolean | null
    isAnaphylactic: boolean | null
    anaphylaxisPlan?: AnaphylaxisPlan
}

export type PreschoolProgramV2BookingForm = Omit<z.infer<typeof formSchema>, 'children'> & {
    children: ChildForm[]
}

export const defaultValues: PreschoolProgramV2BookingForm = {
    studio: null,
    parentFirstName: '',
    parentLastName: '',
    parentEmailAddress: '',
    parentPhone: '',
    children: [
        {
            firstName: '',
            lastName: '',
            dob: undefined as unknown as Date,
            hasAllergies: null,
            allergies: undefined,
            isAnaphylactic: null,
            anaphylaxisPlan: undefined,
            additionalInfo: undefined,
        },
    ],
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactNumber: '',
    termsAndConditions: false,
    joinMailingList: true,
}

export function useBookingForm() {
    return useFormContext<PreschoolProgramV2BookingForm>()
}
