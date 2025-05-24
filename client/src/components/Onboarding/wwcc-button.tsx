import { Button, Modal, Typography } from 'antd'
import type { Employee } from 'fizz-kidz'
import type { MouseEvent } from 'react'
import { useState } from 'react'

import useFirebase from '@components/Hooks/context/UseFirebase'

export const WWCCButton = ({ employee }: { employee: Employee }) => {
    const firebase = useFirebase()
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(false)

    const onClick = (e: MouseEvent) => {
        e.stopPropagation()
        setShowModal(true)
    }

    const updateEmployee = async () => {
        setLoading(true)
        await firebase.db.doc(`employees/${employee.id}`).update({ 'wwcc.status': 'I have a WWCC' })
        setLoading(false)
        setShowModal(false)
    }

    return (
        <>
            <Button onClick={onClick}>WWCC Provided</Button>
            <div onClick={(e) => e.stopPropagation()}>
                <Modal
                    open={showModal}
                    onCancel={() => setShowModal(false)}
                    onOk={updateEmployee}
                    confirmLoading={loading}
                >
                    <Typography.Title level={5}>Photo of WWCC has been provided.</Typography.Title>
                    <Typography.Text>
                        Click 'OK' once the employee has provided you a photo of their working with childrens check, and
                        the photo has been uploaded to their folder on Google Drive.
                    </Typography.Text>
                    <br />
                    <br />
                    <Typography.Text>
                        This will also ensure they will not be included in the fortnightly reminder sent to
                        'people@fizzkidz.com.au'.
                    </Typography.Text>
                </Modal>
            </div>
        </>
    )
}
