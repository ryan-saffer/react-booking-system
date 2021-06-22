import React from 'react'
import { Acuity } from 'fizz-kidz'
import useUpdateScienceEnrolment from '../../Hooks/UseUpdateScienceEnrolment'
import useQueryParam from '../../Hooks/UseQueryParam'
import { Divider, makeStyles } from '@material-ui/core'

import * as logo from '../../../drawables/fizz-logo.png'
import Loading from './Loading'
import Footer from './Footer'
import { Success, Error as ErrorResult } from './Result'


/**
 * Page requires 4 URL query params:
 * 
 * @param appointmentTypeId the id of the science class
 * @param email email of the parent
 * @param chilName childs name
 * @param continuing either 'yes' if they want to continue with the term, or ''
 */
const EnrolmentPage = () => {

    const classes = useStyles()

    const base64String = window.location.search
    let queryParams = Buffer.from(base64String, 'base64').toString('utf8')

    const email = useQueryParam<Acuity.Client.UpdateScienceEnrolmentParams>('email', queryParams) as string
    const appointmentTypeId = parseInt(useQueryParam<Acuity.Client.UpdateScienceEnrolmentParams>('appointmentTypeId', queryParams) as string)
    const childName = useQueryParam<Acuity.Client.UpdateScienceEnrolmentParams>('childName', queryParams) as string
    const continuing = useQueryParam<any>('continuing', queryParams) as Acuity.Client.ContinuingOption // 'any' to avoid requiring to use 'value'

    const service = useUpdateScienceEnrolment({
        email,
        appointmentTypeId,
        childName,
        fieldId: Acuity.Constants.FormFields.CONTINUING_WITH_TERM,
        value: continuing
    })

    return (
        <div className={classes.main}>
            <img className={classes.logo} src={logo.default} />
            <Divider className={classes.divider} />
            {service.status === "loading" && <Loading />}
            {service.status === "loaded" && <Success continuing={continuing} appointments={service.result} />}
            {service.status === "error" && <ErrorResult />}
            <Footer />
        </div>
    )
}

const useStyles = makeStyles({
    main: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        marginTop: 20
    },
    logo: {
        margin: 'auto',
        width: 200
    },
    divider: {
        alignSelf: 'center',
        marginTop: 20,
        marginBottom: 40,
        width: '80%'
    },
    sendEmailButton: {
        alignSelf: 'center',
    }
})

export default EnrolmentPage