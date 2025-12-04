/**
 * Pulled into its own function since its used for:
 *  - query params in the create invitation page
 *  - router state in the design page
 */
export function hasRequiredState(
    bookingId: string | null,
    parentName: string | null,
    parentNumber: string | null,
    childName: string | null,
    childAge: string | null,
    date: string | Date | null,
    time: string | null,
    type: string | null,
    studio: string | null,
    address: string | null,
    rsvpDate: string | Date | null
) {
    if (
        bookingId &&
        parentName &&
        parentNumber &&
        childName &&
        childAge &&
        date &&
        time &&
        type &&
        rsvpDate &&
        studio
    ) {
        // ensure combination of type and studio / address
        if (type === 'mobile' && address) {
            return true
        }
        return true
    }
    return false
}
