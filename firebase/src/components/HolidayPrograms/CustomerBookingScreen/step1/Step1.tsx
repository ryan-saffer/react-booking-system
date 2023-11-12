import { Alert, Button, Card, Checkbox, Form, Select, Tag } from 'antd'
import type { CheckboxChangeEvent } from 'antd/es/checkbox'
import { AcuityTypes, Location } from 'fizz-kidz'
import { DateTime } from 'luxon'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'

import { capitalise } from '@utils/stringUtilities'

import { DISCOUNT_PRICE, getSameDayClasses } from '../utilities'

const { Option } = Select

type Props = {
    classes: AcuityTypes.Api.Class[]
    selectedClasses: AcuityTypes.Api.Class[]
    selectedStore: string
    setSelectedStore: Dispatch<SetStateAction<string>>
    onClassSelectionChange: (e: CheckboxChangeEvent) => void
}

const Step1: React.FC<Props> = ({
    classes,
    selectedStore,
    setSelectedStore,
    onClassSelectionChange,
    selectedClasses,
}) => {
    const [filteredClasses, setFilteredClasses] = useState<AcuityTypes.Api.Class[]>()

    useEffect(() => {
        if (selectedStore !== '') {
            setFilteredClasses(classes?.filter((it) => it.calendar.toLowerCase().includes(selectedStore)))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedStore])

    const discountedClasses = getSameDayClasses(selectedClasses)

    const getSlotsAvailable = (klass: AcuityTypes.Api.Class) => {
        if (klass.slotsAvailable === 0) {
            return 'No spots left'
        }
        if (klass.slotsAvailable < 6 && klass.slotsAvailable > 1) {
            return `${klass.slotsAvailable} spots left`
        }
        if (klass.slotsAvailable === 1) {
            return '1 spot left'
        }
        return ''
    }

    return (
        <>
            <Form.Item name="store" label="Which studio do you want to book for?">
                <Select value={selectedStore} onChange={(store) => setSelectedStore(store)}>
                    {(() => {
                        if (import.meta.env.VITE_ENV === 'prod') {
                            return Object.values(Location).map((location) => (
                                <Option value={location} key={location}>
                                    {capitalise(location)}
                                </Option>
                            ))
                        } else {
                            return (
                                <Option value="test" key="test">
                                    Test
                                </Option>
                            )
                        }
                    })()}
                </Select>
            </Form.Item>
            {filteredClasses && filteredClasses.length !== 0 && (
                <Alert
                    type="info"
                    message="Check our website to see what we will be making each day."
                    action={
                        <Button type="link" href="https://www.fizzkidz.com.au/holiday-programs">
                            View schedule
                        </Button>
                    }
                    style={{ marginBottom: 16 }}
                />
            )}
            {filteredClasses?.map((klass) => {
                const name = `${klass.id}-checkbox`
                const slotsAvailable = getSlotsAvailable(klass)
                return (
                    <Form.Item style={{ marginBottom: 4 }} key={klass.id} name={name} valuePropName="checked">
                        <Checkbox
                            value={klass.id}
                            disabled={klass.slotsAvailable === 0}
                            onChange={onClassSelectionChange}
                        >
                            <p style={{ marginTop: 0, marginBottom: 4 }}>
                                {DateTime.fromISO(klass.time).toLocaleString({
                                    weekday: 'long',
                                    month: 'short',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true,
                                })}
                            </p>
                            {slotsAvailable && (
                                <p style={{ marginTop: 0, marginBottom: 4 }}>
                                    [<em>{slotsAvailable}</em>]
                                </p>
                            )}
                            {discountedClasses.includes(klass.id) && (
                                <Tag color="green">All day discount: -${DISCOUNT_PRICE}.00</Tag>
                            )}
                        </Checkbox>
                    </Form.Item>
                )
            })}
            {filteredClasses?.length === 0 && (
                <Card title="No programs available" style={{ marginBottom: 24 }}>
                    <p>There are no programs available at the moment for this studio.</p>
                    <p>Try picking another location.</p>
                </Card>
            )}
        </>
    )
}

export default Step1
