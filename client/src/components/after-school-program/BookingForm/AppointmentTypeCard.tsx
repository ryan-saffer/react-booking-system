import { Card } from 'antd'
import { AcuityTypes } from 'fizz-kidz'
import React from 'react'

import { Grow } from '@mui/material'

import styles from './AppointmentTypeCard.module.css'

type Props = {
    appointmentType: AcuityTypes.Api.AppointmentType
    logoUrl: string
    onClick: () => void
}

// const StyledCard = styled(Card)(() => ({}))

const AppointmentTypeCard = React.forwardRef<HTMLDivElement, Props>(({ appointmentType, logoUrl, onClick }, ref) => {
    return (
        <>
            <Grow in>
                <Card className={styles.card} ref={ref} onClick={onClick}>
                    <div className={styles.heading}>
                        <strong>{appointmentType.name}</strong>
                    </div>
                    <div className={styles.detailsContainer}>
                        <div className={styles.description}>
                            {appointmentType.description.split('\n').map((line) => (
                                <p key={line}>{line}</p>
                            ))}
                        </div>
                        <img className={styles.logo} src={logoUrl} alt="School Logo" />
                    </div>
                </Card>
            </Grow>
        </>
    )
})

export default AppointmentTypeCard
