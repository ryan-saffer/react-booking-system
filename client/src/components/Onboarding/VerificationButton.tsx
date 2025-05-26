import { Button, Modal, Typography } from 'antd'
import type { Employee } from 'fizz-kidz'
import type { MouseEvent } from 'react'
import React, { useState } from 'react'

import useFirebase from '@components/Hooks/context/UseFirebase'

type Props = { employee: Employee }

const VerificationButton: React.FC<Props> = ({ employee }) => {
    const firebase = useFirebase()
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(false)

    const onClick = (e: MouseEvent) => {
        e.stopPropagation()
        setShowModal(true)
    }

    const onVerify = () => {
        setLoading(true)
        // timeout to make it feel like its thinking..
        setTimeout(async () => {
            await firebase.db.doc(`employees/${employee.id}`).update({ status: 'complete' })
            onCancel()
        }, 1000)
    }

    const onCancel = () => {
        setShowModal(false)
        setLoading(false)
    }

    return (
        <>
            <Button onClick={onClick}>Verify</Button>
            <div onClick={(e) => e.stopPropagation()}>
                <Modal
                    open={showModal}
                    onCancel={onCancel}
                    okText="I verify all steps have been completed"
                    onOk={onVerify}
                    confirmLoading={loading}
                    cancelButtonProps={{ disabled: loading }}
                    width={800}
                    closable={false}
                    keyboard={false}
                    maskClosable={false}
                >
                    <Typography.Title level={4}>Employee Verification</Typography.Title>
                    <Typography.Text>
                        This employee has completed their onboarding form, and needs some final steps completed before
                        they can be finalised and invite to Sling.
                    </Typography.Text>
                    <ol>
                        <strong>
                            <li>Check their Google Drive folder</li>
                        </strong>
                        The employee should have a folder in the 'Current Fizz Kidz Staff' that includes:
                        <ul>
                            <li>Summary of their onboarding form</li>
                            <li>TFN and Super declaration document</li>
                            <li>Photo of WWCC (or a reference number provided in the form)</li>
                            <li>A copy of their signed contract</li>
                        </ul>
                        <br />
                        <strong>
                            <li>
                                Add the employee to the{' '}
                                <a href="https://docs.google.com/spreadsheets/d/1UZthrlCl9pajW7yCurD2x5EGd5tJZiKOHO75BxRZFok/edit#gid=633665538">
                                    Team Pay Rates Google sheet.
                                </a>
                            </li>
                        </strong>
                        <ul>
                            <li>
                                Add their name to the 'Recent Changes' tab so the bookkeeper can ensure they are
                                correctly created.
                            </li>
                        </ul>
                        <br />
                        <strong>
                            <li>Create and invite the user to Sling</li>
                        </strong>
                        Be sure to add them to the appropriate locations and roles!
                    </ol>
                </Modal>
            </div>
        </>
    )
}

export default VerificationButton
