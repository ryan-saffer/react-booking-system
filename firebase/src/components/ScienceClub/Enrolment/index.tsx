import React, { useEffect } from 'react'
import { Acuity } from 'fizz-kidz'
import useQueryParam from '../../Hooks/UseQueryParam'
import { Divider, makeStyles } from '@material-ui/core'

import * as logo from '../../../drawables/fizz-logo.png'
import Loading from './Loading'
import Footer from './Footer'
import { Success, Error as ErrorResult } from './Result'
import useFirebaseFunction from '../../Hooks/api/UseFirebaseFunction'
import useMixpanel from '../../Hooks/context/UseMixpanel'
import { MixpanelEvents } from '../../Mixpanel/Events'

/**
 * Page requires 2 URL query params:
 *
 * @param appointmentId the id of the science class
 * @param continuing either 'yes' if they want to continue with the term, or ''
 */
export const EnrolmentPage = () => {
    const classes = useStyles()

    // remove first '?'
    const base64String = window.location.search.substring(1, window.location.search.length)
    const queryParams = atob(base64String)

    const appointmentId = useQueryParam<any>('appointmentId', true, queryParams) as string
    const continuingWithTerm = useQueryParam<any>('continuing', true, queryParams) as Acuity.Client.ContinuingOption // 'any' to avoid requiring to use 'value'

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
        <div className={classes.main}>
            <img className={classes.logo} src={logo.default} alt="fizz kidz logo" />
            <Divider className={classes.divider} />
            {service.status === 'loading' && <Loading />}
            {service.status === 'loaded' && <Success continuing={continuingWithTerm} appointment={service.result} />}
            {service.status === 'error' && <ErrorResult />}
            <Footer />
        </div>
    )
}

const useStyles = makeStyles({
    main: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        marginTop: 20,
    },
    logo: {
        margin: 'auto',
        width: 200,
    },
    divider: {
        alignSelf: 'center',
        marginTop: 20,
        marginBottom: 40,
        width: '80%',
    },
    sendEmailButton: {
        alignSelf: 'center',
    },
})
