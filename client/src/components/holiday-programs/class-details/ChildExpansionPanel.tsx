import { ExclamationCircleOutlined } from '@ant-design/icons'
import { styled } from '@mui/material/styles'
import { useMutation } from '@tanstack/react-query'
import { Button as AntButton, Collapse, List, Modal, Tag } from 'antd'
import React, { useState } from 'react'

import type { AcuityTypes } from 'fizz-kidz'
import { AcuityConstants, AcuityUtilities } from 'fizz-kidz'

import Loader from '@components/Shared/Loader'
import { formatMobileNumber } from '@utils/stringUtilities'
import { useTRPC } from '@utils/trpc'

const PREFIX = 'ChildExpansionPanel'

const classes = {
    panel: `${PREFIX}-panel`,
}

const anaphylaxisPlanButtonStyle = {
    backgroundColor: '#fa541c',
    borderColor: '#fa541c',
    color: 'white',
}

const StyledCollapse = styled(Collapse)({
    [`&.${classes.panel}`]: {
        '& .ant-collapse-header': {
            alignItems: 'center !important',
        },
    },
})

type Props = {
    appointment: AcuityTypes.Api.Appointment
}

const ChildExpansionPanel: React.FC<Props> = ({ appointment: originalAppointment, ...props }) => {
    const trpc = useTRPC()
    const [appointment, setAppointment] = useState(originalAppointment)
    const [loading, setLoading] = useState(false)
    const [showAnaphylaxisPrompt, setShowAnaphylaxisPrompt] = useState(false)
    const [showAnaphylaxisPlan, setShowAnaphylaxisPlan] = useState(false)
    const [anaphylaxisPlanViewUrl, setAnaphylaxisPlanViewUrl] = useState('')
    const [allowSignInFromAnaphylaxisPlan, setAllowSignInFromAnaphylaxisPlan] = useState(false)

    const updateLabelMutation = useMutation(trpc.acuity.updateLabel.mutationOptions())
    const getAnaphylaxisPlanUrlMutation = useMutation(trpc.holidayPrograms.getAnaphylaxisPlanUrl.mutationOptions())

    const notSignedIn = appointment.labels === null
    const isSignedIn = appointment.labels && appointment.labels[0].id === AcuityConstants.Labels.CHECKED_IN

    const childName = AcuityUtilities.retrieveFormAndField(
        appointment,
        AcuityConstants.Forms.CHILDREN_DETAILS,
        AcuityConstants.FormFields.CHILDREN_NAMES
    )
    const childAge = AcuityUtilities.retrieveFormAndField(
        appointment,
        AcuityConstants.Forms.CHILDREN_DETAILS,
        AcuityConstants.FormFields.CHILDREN_AGES
    )

    const allergies = AcuityUtilities.retrieveFormAndField(
        appointment,
        AcuityConstants.Forms.CHILDREN_DETAILS,
        AcuityConstants.FormFields.CHILDREN_ALLERGIES
    )
    const additionalInfo = AcuityUtilities.retrieveFormAndField(
        appointment,
        AcuityConstants.Forms.CHILDREN_DETAILS,
        AcuityConstants.FormFields.CHILD_ADDITIONAL_INFO
    )
    const emergencyContactName = AcuityUtilities.retrieveFormAndField(
        appointment,
        AcuityConstants.Forms.HOLIDAY_PROGRAM_EMERGENCY_CONTACT,
        AcuityConstants.FormFields.EMERGENCY_CONTACT_NAME_HP
    )
    const emergencyContactNumber = AcuityUtilities.retrieveFormAndField(
        appointment,
        AcuityConstants.Forms.HOLIDAY_PROGRAM_EMERGENCY_CONTACT,
        AcuityConstants.FormFields.EMERGENCY_CONTACT_NUMBER_HP
    )
    const hasAllergies = allergies !== ''
    const isAnaphylactic = allergies.includes('Anaphylactic: Yes')
    const anaphylaxisPlanUrl = allergies.match(/Anaphylaxis plan:\s*(https?:\/\/\S+)/)?.[1] || ''
    const allergiesWithoutAnaphylaxisPlan = allergies.replace(/\n*\s*Anaphylaxis plan:\s*https?:\/\/\S+/, '').trim()
    const stayingAllDay = appointment.certificate === 'ALLDAY'

    const updateLabel = async (value: AcuityTypes.Client.Label) => {
        try {
            const result = await updateLabelMutation.mutateAsync({
                appointmentId: appointment.id,
                label: value,
            })

            setAppointment(result)
            setLoading(false)
        } catch (err) {
            console.error(err)
            setLoading(false)
        }
    }

    const signIn = () => {
        setLoading(true)
        updateLabel('checked-in')
    }

    const handleSignIn = (e: any) => {
        e.stopPropagation()

        if (isAnaphylactic) {
            setAllowSignInFromAnaphylaxisPlan(true)
            setShowAnaphylaxisPrompt(true)
            return
        }

        signIn()
    }

    const handleSignOut = (e: any) => {
        e.stopPropagation()
        setLoading(true)
        updateLabel('none')
    }

    const renderMultilineWithLinks = (value: string) => {
        return (
            <span style={{ whiteSpace: 'pre-wrap' }}>
                {value.split(/(https?:\/\/\S+)/g).map((part) =>
                    part.startsWith('http') ? (
                        <a key={part} href={part} target="_blank" rel="noreferrer">
                            {part}
                        </a>
                    ) : (
                        part
                    )
                )}
            </span>
        )
    }

    const loadAnaphylaxisPlan = async () => {
        if (!anaphylaxisPlanUrl) {
            return
        }

        setAnaphylaxisPlanViewUrl('')
        setShowAnaphylaxisPlan(true)

        try {
            const refreshedUrl = await getAnaphylaxisPlanUrlMutation.mutateAsync({ anaphylaxisPlanUrl })
            setAnaphylaxisPlanViewUrl(refreshedUrl)
        } catch (err) {
            console.error(err)
        }
    }

    const handleViewAnaphylaxisPlan = () => {
        setAllowSignInFromAnaphylaxisPlan(false)
        setShowAnaphylaxisPrompt(true)
        void loadAnaphylaxisPlan()
    }

    const renderAllergies = () => {
        return (
            <div className="space-y-2">
                {!!allergiesWithoutAnaphylaxisPlan && renderMultilineWithLinks(allergiesWithoutAnaphylaxisPlan)}
                {!!anaphylaxisPlanUrl && (
                    <div>
                        <AntButton size="small" style={anaphylaxisPlanButtonStyle} onClick={handleViewAnaphylaxisPlan}>
                            View anaphylaxis plan
                        </AntButton>
                    </div>
                )}
            </div>
        )
    }

    const childInfo = [
        {
            label: 'Allergies',
            value: renderAllergies(),
            render: hasAllergies,
        },
        {
            label: 'Notes',
            value: renderMultilineWithLinks(additionalInfo),
            render: !!additionalInfo,
        },
        {
            label: 'Parent Name',
            value: `${appointment.firstName} ${appointment.lastName}`,
            render: true,
        },
        {
            label: 'Parent Phone',
            value: formatMobileNumber(appointment.phone),
            render: true,
        },
        {
            label: 'Parent Email',
            value: appointment.email,
            render: true,
        },
        {
            label: 'Emergency Contact',
            value: emergencyContactName,
            render: true,
        },
        {
            label: 'Emergency Contact Number',
            value: emergencyContactNumber,
            render: true,
        },
    ]

    const renderExtra = () => {
        return (
            <div className="flex items-center gap-4">
                {hasAllergies && (
                    <Tag color="red" icon={<ExclamationCircleOutlined />}>
                        Allergy
                    </Tag>
                )}
                {isAnaphylactic && (
                    <Tag color="volcano" icon={<ExclamationCircleOutlined />}>
                        Anaphylactic
                    </Tag>
                )}
                {stayingAllDay && <Tag color="geekblue">All Day</Tag>}
                {!!additionalInfo && <Tag color="magenta">Includes Notes</Tag>}
                {notSignedIn && (
                    <AntButton
                        style={{ background: '#B14592', color: 'white' }}
                        loading={loading}
                        onClick={handleSignIn}
                    >
                        Sign in
                    </AntButton>
                )}
            </div>
        )
    }

    const handleCloseAnaphylaxisPrompt = () => {
        setShowAnaphylaxisPrompt(false)
        setShowAnaphylaxisPlan(false)
        setAnaphylaxisPlanViewUrl('')
        setAllowSignInFromAnaphylaxisPlan(false)
    }

    const renderAnaphylaxisPlan = () => {
        if (getAnaphylaxisPlanUrlMutation.isPending) {
            return (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '75vh' }}>
                    <Loader />
                </div>
            )
        }

        if (!anaphylaxisPlanViewUrl) {
            return <p>Unable to load the anaphylaxis plan. Please try again.</p>
        }

        return (
            <iframe
                title={`${childName} anaphylaxis plan`}
                src={anaphylaxisPlanViewUrl}
                style={{ width: '100%', height: '75vh', border: 0 }}
            />
        )
    }

    const handleVerifyAndSignIn = () => {
        handleCloseAnaphylaxisPrompt()
        signIn()
    }

    return (
        <>
            <StyledCollapse
                className={classes.panel}
                {...props}
                items={[
                    {
                        key: appointment.id,
                        label: (
                            <p style={{ margin: 0 }}>
                                {childName} <i>({childAge})</i>
                            </p>
                        ),
                        extra: renderExtra(),
                        children: (
                            <>
                                <List
                                    dataSource={childInfo}
                                    renderItem={(item) =>
                                        item.render && (
                                            <List.Item>
                                                {<strong>{item.label}</strong>}: {item.value}
                                            </List.Item>
                                        )
                                    }
                                />
                                {isSignedIn && (
                                    <div style={{ display: 'flex', justifyContent: 'end' }}>
                                        <AntButton
                                            style={{
                                                backgroundColor: '#fff1f0',
                                                borderColor: '#ffa39e',
                                                color: '#cf1322',
                                            }}
                                            loading={loading}
                                            onClick={handleSignOut}
                                        >
                                            Undo Sign In
                                        </AntButton>
                                    </div>
                                )}
                            </>
                        ),
                    },
                ]}
            />
            <Modal
                title={allowSignInFromAnaphylaxisPlan ? 'Anaphylaxis plan verification' : 'Anaphylaxis plan'}
                open={showAnaphylaxisPrompt}
                onCancel={handleCloseAnaphylaxisPrompt}
                width={showAnaphylaxisPlan ? '90vw' : 520}
                style={showAnaphylaxisPlan ? { top: 24 } : undefined}
                footer={
                    showAnaphylaxisPlan
                        ? allowSignInFromAnaphylaxisPlan
                            ? [
                                  <AntButton key="back" onClick={() => setShowAnaphylaxisPlan(false)}>
                                      Back
                                  </AntButton>,
                                  <AntButton
                                      key="sign-in"
                                      type="primary"
                                      loading={loading}
                                      onClick={handleVerifyAndSignIn}
                                  >
                                      Verified and sign in
                                  </AntButton>,
                              ]
                            : [
                                  <AntButton key="close" type="primary" onClick={handleCloseAnaphylaxisPrompt}>
                                      Close
                                  </AntButton>,
                              ]
                        : [
                              <AntButton key="cancel" onClick={handleCloseAnaphylaxisPrompt}>
                                  Cancel
                              </AntButton>,
                              <AntButton
                                  key="view-plan"
                                  style={anaphylaxisPlanButtonStyle}
                                  disabled={!anaphylaxisPlanUrl}
                                  onClick={() => void loadAnaphylaxisPlan()}
                              >
                                  View anaphylaxis plan
                              </AntButton>,
                          ]
                }
            >
                {showAnaphylaxisPlan ? (
                    renderAnaphylaxisPlan()
                ) : (
                    <p>
                        This child is anaphylatic. Please verify their anaphylaxis plan is accurate, and discuss any
                        issues with the parent.
                    </p>
                )}
            </Modal>
        </>
    )
}

export default ChildExpansionPanel
