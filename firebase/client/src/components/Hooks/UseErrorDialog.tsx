import React, { useCallback, useState } from 'react'
import { Button, Modal } from 'antd'

type Props = {
    message: string
    title?: string
}

export type WithErrorModal = {
    showError: (props: Props) => void
}

type Result = {
    ErrorModal: React.FC
} & WithErrorModal

const useErrorDialog = (): Result => {
    const [showModal, setShowModal] = useState(false)
    const [message, setMessage] = useState('')
    const [title, setTitle] = useState('')

    const showError = useCallback((props: Props) => {
        setMessage(props.message)
        setTitle(props.title || 'Something went wrong')
        setShowModal(true)
    }, [])

    const _Modal = () => {
        return (
            <Modal
                title={title}
                open={showModal}
                footer={[
                    <Button type="primary" key="ok" onClick={() => setShowModal(false)}>
                        OK
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
