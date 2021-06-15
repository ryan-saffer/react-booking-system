import React from 'react'
import { Acuity } from 'fizz-kidz'
import useUpdateScienceEnrolment from '../../Hooks/UseUpdateScienceEnrolment'
import useQueryParam from '../../Hooks/UseQueryParam'
import { Divider, makeStyles } from '@material-ui/core'

import * as logo from '../../../drawables/fizz-logo.png'
import Loading from './Loading'
import Footer from './Footer'
import { Success, Error } from './Result'

const EnrolmentPage = () => {

    const classes = useStyles()

    const base64String = window.location.search
    let queryParams = Buffer.from(base64String, 'base64').toString('utf8')

    const email = useQueryParam<Acuity.Client.UpdateScienceEnrolmentParams>('email', queryParams) as string
    const appointmentTypeId = parseInt(useQueryParam<Acuity.Client.UpdateScienceEnrolmentParams>('appointmentTypeId', queryParams) as string)
    const childName = useQueryParam<Acuity.Client.UpdateScienceEnrolmentParams>('childName', queryParams) as string
    const continuing = useQueryParam<Acuity.Client.UpdateScienceEnrolmentParams>('continuing', queryParams) as Acuity.Client.ContinuingOptions

    const service = useUpdateScienceEnrolment({
        email,
        appointmentTypeId,
        childName,
        continuing
    })

    return (
        <div className={classes.main}>
            <img className={classes.logo} src={logo.default} />
            <Divider className={classes.divider} />
            {service.status === "loading" && <Loading />}
            {service.status === "loaded" && <Success appointments={service.result} />}
            {service.status === "error" && <Error />}
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
    loading: {

    }
})

export default EnrolmentPage