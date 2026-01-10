import React, { useState } from 'react'
import type { MouseEvent } from 'react'
import { Button, Modal, Typography } from 'antd'
import type { Employee } from 'fizz-kidz'
import useFirebase from '@components/Hooks/context/UseFirebase'
import { deleteDoc, doc } from 'firebase/firestore'

type Props = { employee: Employee }

export const DeleteEmployeeButton: React.FC<Props> = ({ employee }) => {
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
            await deleteDoc(doc(firebase.db, 'employees', employee.id))
            onCancel()
        }, 500)
    }

    const onCancel = () => {
        setShowModal(false)
        setLoading(false)
    }

    return (
        <>
            <Button onClick={onClick}>Delete row</Button>
            <div onClick={(e) => e.stopPropagation()}>
                <Modal
                    open={showModal}
                    onCancel={onCancel}
                    okText="Delete row"
                    onOk={onVerify}
                    confirmLoading={loading}
                    cancelButtonProps={{ disabled: loading }}
                    width={800}
                    closable={false}
                    keyboard={false}
                    maskClosable={false}
                >
                    <Typography.Title level={4}>Are you sure you want to delete this row?</Typography.Title>
                    <Typography.Text>Any data in Google Drive will not be touched.</Typography.Text>
                </Modal>
            </div>
        </>
    )
}
