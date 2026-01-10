import type { AcuityTypes } from 'fizz-kidz'
import { useEffect } from 'react'

import useMixpanel from '@components/Hooks/context/UseMixpanel'
import { MixpanelEvents } from '@components/Mixpanel/Events'
import * as logo from '@drawables/fizz-logo.png'
import { Divider } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useTRPC } from '@utils/trpc'

import Footer from './Footer'
import Loading from './Loading'
import { Error as ErrorResult, Success } from './Result'

import { useMutation } from '@tanstack/react-query'

const PREFIX = 'EnrolmentPage'

const classes = {
    main: `${PREFIX}-main`,
    logo: `${PREFIX}-logo`,
    divider: `${PREFIX}-divider`,
    sendEmailButton: `${PREFIX}-sendEmailButton`,
}

const Root = styled('div')({
    [`&.${classes.main}`]: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        marginTop: 20,
    },
    [`& .${classes.logo}`]: {
        margin: 'auto',
        width: 200,
    },
    [`& .${classes.divider}`]: {
        alignSelf: 'center',
        marginTop: 20,
        marginBottom: 40,
        width: '80%',
    },
    [`& .${classes.sendEmailButton}`]: {
        alignSelf: 'center',
    },
})

/**
 * Page requires 2 URL query params:
 *
 * @param appointmentId the id of the science class
 * @param continuing either 'yes' if they want to continue with the term, or ''
 */
export const EnrolmentPage = () => {
    const trpc = useTRPC()
    // remove first '?'
    const base64String = window.location.search.substring(1, window.location.search.length)
    const searchParams = new URLSearchParams(atob(base64String))

    const appointmentId = searchParams.get('appointmentId')!
    const continuingWithTerm = searchParams.get('continuing') as AcuityTypes.Client.ContinuingOption

    const mixpanel = useMixpanel()

    const { mutate, data, isPending, isSuccess, isError } = useMutation(
        trpc.afterSchoolProgram.updateAfterSchoolEnrolment.mutationOptions()
    )

    useEffect(() => {
        mutate({ id: appointmentId, continuingWithTerm })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Mixpanel Tracking
    useEffect(() => {
        if (isSuccess) {
            const props = {
                distinct_id: data.parent.email,
                appointment: data.className,
            }
            if (continuingWithTerm === 'yes') {
                mixpanel.track(MixpanelEvents.SCIENCE_ENROLMENT_CONFIRMED, props)
            }
            if (continuingWithTerm === 'no') {
                mixpanel.track(MixpanelEvents.SCIENCE_ENROLMENT_CANCELLED, props)
            }
        }

        if (isError) {
            mixpanel.track(MixpanelEvents.SCIENCE_ENROLMENT_ERROR, {
                appointment_id: appointmentId,
                continuing_with_term: continuingWithTerm,
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSuccess, isError])

    return (
        <Root className={classes.main}>
            <img className={classes.logo} src={logo.default} alt="fizz kidz logo" />
            <Divider className={classes.divider} />
            {isPending && <Loading />}
            {isSuccess && <Success continuing={continuingWithTerm} appointment={data} />}
            {isError && <ErrorResult />}
            <Footer />
        </Root>
    )
}
