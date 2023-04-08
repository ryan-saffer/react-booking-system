import { Button, Modal } from 'antd'
import React from 'react'

type Props = {
    open: boolean
    onClose: () => void
}

const CancellationPolicyModal: React.FC<Props> = ({ open, onClose }) => {
    return (
        <Modal
            title="Terms and conditions"
            open={open}
            onCancel={() => onClose()}
            footer={[
                <Button type="primary" onClick={() => onClose()}>
                    OK
                </Button>,
            ]}
        >
            <strong>Cancellation Policy</strong>
            <p />
            <p>
                A full refund will be automatically issued for cancellations made more than 24 hours before the program.
            </p>
            <p>Cancellations made less than 24 hours before the program will not be refunded.</p>
        </Modal>
    )
}

export default CancellationPolicyModal
