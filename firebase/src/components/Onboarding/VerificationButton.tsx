import { Button, Modal, Typography } from 'antd'
import { Employee } from 'fizz-kidz'
import React, { MouseEvent, useState } from 'react'
import useFirebase from '../Hooks/context/UseFirebase'

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
            await firebase.db.doc(`employees/${employee.id}`).update({ status: 'complete' } satisfies Partial<Employee>)
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
                            <li>Verify the user was created in Xero, and add the following details:</li>
                        </strong>
                        <ul>
                            <li>Their Tax details according to their TFN form in the 'Taxes' tab</li>
                            <li>Their superannuation membership in the 'Employement' tab</li>
                            <li>Add a superannuation line to their 'Pay Template'</li>
                            <li>Invite the user to 'Xero Me'</li>
                        </ul>
                        <br />
                        <strong>
                            <li>Verify the user is created in Sling</li>
                        </strong>
                        Once verified, be sure you <strong>invite the user to Sling.</strong>
                    </ol>
                </Modal>
            </div>
        </>
    )
}

export default VerificationButton
