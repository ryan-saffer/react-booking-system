import type { Location } from 'fizz-kidz'
import { useFormContext } from 'react-hook-form'
import { z } from 'zod'

const phoneRegex = new RegExp(/^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/)
export const GRADES = ['Prep', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'] as const

const childSchema = z
    .object({
        // All fields here are optional to allow appending an empty child (see https://github.com/orgs/react-hook-form/discussions/10211)
        // By using `refine()` on each optional field, we still enforce that they have a value.
        firstName: z.string().trim().min(1, 'Child first name is required'),
        lastName: z.string().trim().min(1, 'Child last name is required'),
        dob: z
            .date()
            .optional()
            .refine((date) => !!date, 'Date of birth is required'),
        grade: z
            .enum(GRADES)
            .optional()
            .refine((grade) => !!grade, 'Grade is required'),
        hasAllergies: z
            .boolean()
            .optional()
            .refine((val) => val !== undefined, 'Select if the child has any allergies.'),
        allergies: z.string().optional(),
        isAnaphylactic: z.boolean().optional(),
        anaphylaxisPlan: z
            .instanceof(File)
            .optional()
            .refine((file) => {
                if (file) {
                    return file.size < 5_000_000
                }
                return true
            }, 'Anaphylaxis plan must be less than  5MB'),
        needsSupport: z
            .boolean()
            .optional()
            .refine((val) => val !== undefined, 'Select of the child needs additional support'),
        support: z.string().optional(),
        permissionToPhotograph: z
            .boolean()
            .optional()
            .refine((val) => val !== undefined, 'Select if you give permission'),
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
    // only require `isAnaphylactic` if `hasAllergies` is true
    .refine(
        (data) => {
            if (data.hasAllergies && data.isAnaphylactic === undefined) {
                return false
            }
            return true
        },
        {
            message: 'Please let us know if this child is anaphylactic',
            path: ['isAnaphylactic'],
        }
    )
    // only require `anaphylaxisPlan` is `isAnaphylactic` is true
    .refine(
        (data) => {
            if (data.isAnaphylactic && !data.anaphylaxisPlan) {
                return false
            }
            return true
        },
        {
            message: 'Anaphylaxis plan is required.',
            path: ['anaphylaxisPlan'],
        }
    )
    // only require `support` if `needsSupport` is true
    .refine(
        (data) => {
            if (data.needsSupport && !data.support) {
                return false
            }
            return true
        },
        {
            message: 'Please enter how we can best support your child.',
            path: ['support'],
        }
    )

/**
 * Schema is split between 'main' and 'waitingList'.
 *
 * This enables marking each object optional.
 * This way, you can set the value of either to be `undefined` and when submitting, it will pass validation.
 */
export const formSchema = z.object({
    type: z.enum(['studio', 'school']),
    programType: z.enum(['science', 'art']).optional(),
    studio: z.custom<Location>((value) => !!value, 'Please select a studio.').optional(),
    main: z
        .object({
            parentFirstName: z.string().trim().min(1, 'Parent first name is required'),
            parentLastName: z.string().trim().min(1, 'Parent last name is required'),
            parentEmailAddress: z.string().email().trim().toLowerCase(),
            parentPhone: z
                .string()
                .min(10, 'Number must be at least 10 digits')
                .regex(phoneRegex, 'Invalid Number')
                .trim(),
            children: z.array(childSchema),
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
        .optional(),
    classIsFull: z.boolean(),
    waitingList: z
        .object({
            waitingListParentName: z.string().min(1, { message: 'Your name is required.' }),
            waitingListChildName: z.string().min(1, { message: "Child's name is required. " }),
            waitingListParentEmail: z.string().email({ message: 'Please enter a valid email.' }),
            waitingListParentMobile: z.string().regex(phoneRegex, 'Invalid Number'),
        })
        .optional(),
})

export function useEnrolmentForm() {
    return useFormContext<z.infer<typeof formSchema>>()
}
