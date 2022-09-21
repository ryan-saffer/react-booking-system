import React, { useContext, useEffect, useState } from 'react'
import { Acuity, ScienceAppointment, Service } from 'fizz-kidz'
import useQueryParam from '../../Hooks/UseQueryParam'
import { Divider, makeStyles } from '@material-ui/core'

import * as logo from '../../../drawables/fizz-logo.png'
import Loading from './Loading'
import Footer from './Footer'
import { Success, Error as ErrorResult } from './Result'
import Firebase, { FirebaseContext } from '../../Firebase'
import { callFirebaseFunction } from '../../../utilities/firebase/functions'

/**
 * Page requires 2 URL query params:
 *
 * @param appointmentId the id of the science class
 * @param continuing either 'yes' if they want to continue with the term, or ''
 */
const EnrolmentPage = () => {
    const classes = useStyles()

    const firebase = useContext(FirebaseContext) as Firebase

    const [service, setService] = useState<Service<ScienceAppointment>>({ status: 'loading' })

    const base64String = window.location.search
    let queryParams = Buffer.from(base64String, 'base64').toString('utf8')

    const appointmentId = useQueryParam<any>('appointmentId', queryParams) as string
    const continuingWithTerm = useQueryParam<any>('continuing', queryParams) as Acuity.Client.ContinuingOption // 'any' to avoid requiring to use 'value'

    useEffect(() => {
        async function updateEnrolment() {
            try {
                const result = await callFirebaseFunction(
                    'updateScienceEnrolment',
                    firebase
                )({
                    appointmentId,
                    continuingWithTerm,
                })
                setService({ status: 'loaded', result: result.data })
            } catch (error) {
                console.error('Error updating science enrolment:', error)
                setService({ status: 'error', error })
            }
        }
        updateEnrolment()
    }, [])

    return (
        <div className={classes.main}>
            <img className={classes.logo} src={logo.default} />
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

export default EnrolmentPage
