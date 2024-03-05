import { Button, Input, Popover, Typography } from 'antd'
import { DiscountCode } from 'fizz-kidz'
import React, { Dispatch, SetStateAction, useState } from 'react'

import { InfoCircleOutlined } from '@ant-design/icons'
import { trpc } from '@utils/trpc'

import { calculateDiscountedAmount } from '../utilities'

type Props = {
    setDiscount: Dispatch<SetStateAction<DiscountCode | undefined>>
    total: number
}

const DiscountInput: React.FC<Props> = ({ setDiscount, total }) => {
    const [value, setValue] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const checkDiscountCodeMutation = trpc.holidayPrograms.checkDiscountCode.useMutation()

    const validateDiscount = async () => {
        // do not allow the 'allday' discount code
        if (value === 'allday') {
            setLoading(false)
            setError('The certificate "allday" is invalid')
            return
        }

        setLoading(true)
        setError('')

        try {
            const result = await checkDiscountCodeMutation.mutateAsync(value)
            if (result === 'not-found') {
                setError('Invalid discount code.')
            } else if (result === 'expired') {
                setError(`Discount code '${value}' has expired.`)
            } else {
                const resultTransformed = { ...result, expiryDate: new Date(result.expiryDate) }
                if (total - calculateDiscountedAmount(total, resultTransformed) < 0) {
                    setError(
                        `Discount code amount of $${result.discountAmount} is greater than the total of $${total}.`
                    )
                } else {
                    setValue('')
                    setDiscount(resultTransformed)
                }
            }
        } catch (err: any) {
            setError(err.message)
        }
        setLoading(false)
    }

    return (
        <div style={{ marginBottom: 16 }}>
            <>
                <Input.Search
                    style={{ width: '90%' }}
                    value={value}
                    loading={loading}
                    enterButton="Apply"
                    onChange={(e) => {
                        setValue(e.target.value)
                        setError('')
                    }}
                    onSearch={validateDiscount}
                    placeholder="Apply discount code.."
                    status={error ? 'error' : ''}
                />
                <Popover
                    title="Discounts"
                    content={
                        <>
                            <p>Only one discount can be applied at a time.</p>
                            <p>The 'same day discount' will be overriden by any discount added here.</p>
                        </>
                    }
                >
                    <Button style={{ width: '10%' }} type="link" icon={<InfoCircleOutlined />} />
                </Popover>
            </>
            {error && <Typography.Text type="danger">{error}</Typography.Text>}
        </div>
    )
}

export default DiscountInput
