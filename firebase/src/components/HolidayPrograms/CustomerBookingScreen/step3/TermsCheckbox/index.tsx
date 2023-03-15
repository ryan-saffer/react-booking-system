import { Checkbox, Typography } from 'antd'
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

    function onToggle(checked: boolean) {
        setTermsChecked(checked)
        setShowTermsWarning(!checked)
    }

    function showModal(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, modal: 'cancellation' | 'terms') {
        e.stopPropagation()
        if (modal === 'cancellation') {
            setShowCancellationPolicyModal(true)
        }
        if (modal === 'terms') {
            setShowTermsModal(true)
        }
    }

    return (
        <>
            <div style={{ display: 'flex', marginTop: 16 }}>
                <Checkbox checked={termsChecked} onChange={(e) => onToggle(e.target.checked)} />
                <div style={{ cursor: 'pointer', marginLeft: 8 }} onClick={() => onToggle(!termsChecked)}>
                    I have read and agreed to the{' '}
                    <Typography.Link onClick={(e) => showModal(e, 'cancellation')}>Cancellation Policy</Typography.Link>{' '}
                    and the <Typography.Link onClick={(e) => showModal(e, 'terms')}>Terms & Conditions</Typography.Link>
                </div>
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
