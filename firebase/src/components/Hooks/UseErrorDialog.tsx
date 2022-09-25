import React, { ReactElement, useCallback, useState } from 'react'
import { Button, Modal } from 'antd'

export type WithErrorModal = {
    showError: (message: string) => void
}

type Result = {
    ErrorModal: React.FC
} & WithErrorModal

const useErrorDialog = (): Result => {
    const [showModal, setShowModal] = useState(false)
    const [message, setMessage] = useState('')

    const showError = useCallback((message: string) => {
        setMessage(message)
        setShowModal(true)
    }, [])

    const _Modal = () => {
        return (
            <Modal
                title="Something went wrong"
                visible={showModal}
                footer={[
                    <Button type="primary" onClick={() => setShowModal(false)}>
                        Ok
                    </Button>,
                ]}
            >
                <p>{message}</p>
            </Modal>
        )
    }

    return { ErrorModal: _Modal, showError }
}

export default useErrorDialog
