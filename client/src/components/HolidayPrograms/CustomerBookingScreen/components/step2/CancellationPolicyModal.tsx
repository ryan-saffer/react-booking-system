import { Button, Modal } from 'antd'
import React from 'react'

type Props = {
    open: boolean
    onClose: () => void
}

const CancellationPolicyModal: React.FC<Props> = ({ open, onClose }) => {
    return (
        <Modal
            title="Cancellation Policy"
            open={open}
            onCancel={() => onClose()}
            footer={
                <Button type="primary" onClick={() => onClose()}>
                    OK
                </Button>
            }
        >
            <p>
                A full refund will be automatically issued for cancellations made more than 48 hours before the program.
            </p>
            <p>Cancellations made less than 48 hours before the program will not be refunded.</p>
            <p>
                <i>This policy can change at any time at our discretion.</i>
            </p>
        </Modal>
    )
}

export default CancellationPolicyModal
