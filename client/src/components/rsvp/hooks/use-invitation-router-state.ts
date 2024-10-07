import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { useRouterState } from '@components/Hooks/use-router-state'

import { InvitationState } from '../types'
import { hasRequiredState } from '../utils/has-required-state'

/**
 * Ensures that all the required values are present in react routers state.
 * If not, will redirect back to invitation creation page.
 *
 * @returns the invitation state
 */
export function useInvitationRouterState() {
    const state = useRouterState<InvitationState>()

    const navigate = useNavigate()

    const isValid = hasRequiredState(
        state?.bookingId ?? null,
        state?.parentName ?? null,
        state?.parentNumber ?? null,
        state?.childName ?? null,
        state?.childAge ?? null,
        state?.date ?? null,
        state?.time ?? null,
        state?.type ?? null,
        state?.studio ?? null,
        state?.address ?? null,
        state?.rsvpDate ?? null
    )

    useEffect(() => {
        if (!isValid) {
            navigate('/invitations-v2')
        }
    }, [isValid, navigate])

    return {
        bookingId: state!.bookingId!,
        childName: state!.childName!,
        childAge: state!.childAge!,
        parentName: state!.parentName!,
        parentNumber: state!.parentNumber!,
        date: state!.date!,
        time: state!.time!,
        type: state!.type!,
        studio: state!.studio!,
        address: state!.address!,
        rsvpDate: state!.rsvpDate!,
    }
}
