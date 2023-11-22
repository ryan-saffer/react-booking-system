import { AcuityTypes } from 'fizz-kidz'
import { useEffect } from 'react'

import useFirebaseFunction from '@components/Hooks/api/UseFirebaseFunction'
import useMixpanel from '@components/Hooks/context/UseMixpanel'
import { MixpanelEvents } from '@components/Mixpanel/Events'
import * as logo from '@drawables/fizz-logo.png'
import { Divider } from '@mui/material'
import { styled } from '@mui/material/styles'

import Footer from './Footer'
import Loading from './Loading'
import { Error as ErrorResult, Success } from './Result'

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
    // remove first '?'
    const base64String = window.location.search.substring(1, window.location.search.length)
    const searchParams = new URLSearchParams(atob(base64String))

    const appointmentId = searchParams.get('appointmentId')!
    const continuingWithTerm = searchParams.get('continuing') as AcuityTypes.Client.ContinuingOption

    const mixpanel = useMixpanel()

    const service = useFirebaseFunction('updateScienceEnrolment', { id: appointmentId, continuingWithTerm })

    // Mixpanel Tracking
    useEffect(() => {
        if (service.status === 'loaded') {
            const props = {
                distinct_id: service.result.parent.email,
                appointment: service.result.className,
            }
            if (continuingWithTerm === 'yes') {
                mixpanel.track(MixpanelEvents.SCIENCE_ENROLMENT_CONFIRMED, props)
            }
            if (continuingWithTerm === 'no') {
                mixpanel.track(MixpanelEvents.SCIENCE_ENROLMENT_CANCELLED, props)
            }
        }

        if (service.status === 'error') {
            mixpanel.track(MixpanelEvents.SCIENCE_ENROLMENT_ERROR, {
                appointment_id: appointmentId,
                continuing_with_term: continuingWithTerm,
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [service.status])

    return (
        <Root className={classes.main}>
            <img className={classes.logo} src={logo.default} alt="fizz kidz logo" />
            <Divider className={classes.divider} />
            {service.status === 'loading' && <Loading />}
            {service.status === 'loaded' && <Success continuing={continuingWithTerm} appointment={service.result} />}
            {service.status === 'error' && <ErrorResult />}
            <Footer />
        </Root>
    )
}
