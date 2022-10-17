import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Form, Checkbox, Select, Tag, Card } from 'antd'
import type { CheckboxChangeEvent } from 'antd/es/checkbox'
import { Acuity, Locations } from 'fizz-kidz'
import { DateTime } from 'luxon'
import { capitalise } from '../../../../utilities/stringUtilities'
import { DISCOUNT_PRICE, getSameDayClasses } from '../utilities'
const { Option } = Select

type Props = {
    classes: Acuity.Class[]
    selectedClasses: Acuity.Class[]
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
    const [filteredClasses, setFilteredClasses] = useState<Acuity.Class[]>()

    useEffect(() => {
        if (selectedStore !== '') {
            setFilteredClasses(classes?.filter((it) => it.calendar.toLowerCase().includes(selectedStore)))
        }
    }, [selectedStore])

    const discountedClasses = getSameDayClasses(selectedClasses)

    const renderSlotsAvailable = (klass: Acuity.Class) => {
        if (klass.slotsAvailable === 0) {
            return '[No spots left]'
        }
        if (klass.slotsAvailable < 6 && klass.slotsAvailable > 1) {
            return `[${klass.slotsAvailable} spots left]`
        }
        if (klass.slotsAvailable === 1) {
            return '[1 spot left]'
        }
        return ''
    }

    return (
        <>
            <Form.Item name="store" label="Which store do you want to book for?">
                <Select value={selectedStore} onChange={(store) => setSelectedStore(store)}>
                    {(() => {
                        if (process.env.REACT_APP_ENV === 'prod') {
                            return Object.values(Locations).map((location) => {
                                if (location !== Locations.MOBILE) {
                                    return (
                                        <Option value={location} key={location}>
                                            {capitalise(location)}
                                        </Option>
                                    )
                                }
                            })
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
            {filteredClasses?.map((klass) => {
                let name = `${klass.id}-checkbox`
                return (
                    <Form.Item style={{ marginBottom: 4 }} key={klass.id} name={name} valuePropName="checked">
                        <Checkbox
                            value={klass.id}
                            disabled={klass.slotsAvailable === 0}
                            onChange={onClassSelectionChange}
                        >
                            <p style={{ marginBottom: 0 }}>
                                {DateTime.fromISO(klass.time).toLocaleString({
                                    weekday: 'long',
                                    month: 'short',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true,
                                })}
                            </p>
                            <p style={{ marginBottom: 0 }}>{renderSlotsAvailable(klass)}</p>
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
