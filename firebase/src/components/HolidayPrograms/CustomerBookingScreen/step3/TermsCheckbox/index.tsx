import { Checkbox, Typography } from 'antd'
import { CheckboxChangeEvent } from 'antd/es/checkbox'
import React, { forwardRef, ForwardRefRenderFunction, useImperativeHandle, useState } from 'react'
import CancellationPolicyModal from './CancellationPolicyModal'
import TermsAndConditionsModal from './TermsAndConditionsModal'

type Props = {}

export type TermsCheckboxHandle = {
    isChecked: () => boolean
    showWarning: () => void
}

const TermsCheckbox: ForwardRefRenderFunction<TermsCheckboxHandle, Props> = (_, ref) => {
    const [termsChecked, setTermsChecked] = useState(false)

    useImperativeHandle(ref, () => ({
        isChecked() {
            return termsChecked
        },
        showWarning() {
            setShowTermsWarning(true)
        },
    }))

    const [showTermsWarning, setShowTermsWarning] = useState(false)
    const [showCancellationPolicyModal, setShowCancellationPolicyModal] = useState(false)
    const [showTermsModal, setShowTermsModal] = useState(false)

    function onToggle(event: CheckboxChangeEvent) {
        setTermsChecked(event.target.checked)
        setShowTermsWarning(!event.target.checked)
    }

    return (
        <>
            <div style={{ display: 'flex', marginTop: 16 }}>
                <Checkbox checked={termsChecked} onChange={(e) => onToggle(e)}>
                    I have read and agreed to the{' '}
                    <Typography.Link onClick={() => setShowCancellationPolicyModal(true)}>
                        Cancellation Policy
                    </Typography.Link>{' '}
                    and the{' '}
                    <Typography.Link onClick={() => setShowTermsModal(true)}>Terms & Conditions</Typography.Link>
                </Checkbox>
            </div>
            {showTermsWarning && (
                <Typography.Text type="danger">Please accept the terms and conditions</Typography.Text>
            )}
            <CancellationPolicyModal
                visible={showCancellationPolicyModal}
                onClose={() => setShowCancellationPolicyModal(false)}
            />
            <TermsAndConditionsModal visible={showTermsModal} onClose={() => setShowTermsModal(false)} />
        </>
    )
}

export default forwardRef(TermsCheckbox)
