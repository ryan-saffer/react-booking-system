import { Alert, Button, Card, Checkbox, Form, Select, Tag } from 'antd'
import type { CheckboxChangeEvent } from 'antd/es/checkbox'
import { AcuityConstants, AcuityTypes, Location } from 'fizz-kidz'
import { DateTime } from 'luxon'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'

import { capitalise } from '@utils/stringUtilities'

import { getSameDayClasses, PRICE_MAP } from '../utilities'

const { Option } = Select

type Props = {
    appointmentTypeId: AcuityConstants.AppointmentTypeValue
    classes: AcuityTypes.Api.Class[]
    selectedClasses: AcuityTypes.Api.Class[]
    selectedStore: string
    setSelectedStore: Dispatch<SetStateAction<string>>
    onClassSelectionChange: (e: CheckboxChangeEvent) => void
}

const Step1: React.FC<Props> = ({
    appointmentTypeId,
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
                            return Object.values(Location)
                                .filter(
                                    (location) =>
                                        !!classes.find(
                                            (it) => it.calendarID === AcuityConstants.StoreCalendars[location]
                                        )
                                )
                                .map((location) => (
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
            {appointmentTypeId === AcuityConstants.AppointmentTypes.HOLIDAY_PROGRAM &&
                filteredClasses &&
                filteredClasses.length !== 0 && (
                    <>
                        <Alert
                            type="info"
                            message="Check our website to see what we will be making each day."
                            action={
                                <Button type="link" href="https://www.fizzkidz.com.au/holiday-programs" target="_blank">
                                    View schedule
                                </Button>
                            }
                            style={{ marginBottom: 8 }}
                        />
                        <Alert
                            className="twp mb-4 p-3"
                            type="warning"
                            description={
                                <p>
                                    If you would like your child to <strong>stay for the day</strong>, simply book the
                                    morning and afternoon program, bring lunch and we will supervise the break!
                                </p>
                            }
                        />
                    </>
                )}
            {appointmentTypeId === AcuityConstants.AppointmentTypes.KINGSVILLE_OPENING &&
                filteredClasses &&
                filteredClasses.length !== 0 && (
                    <Alert
                        type="info"
                        message={
                            <p style={{ margin: 0 }}>
                                The <strong>10am</strong> session is for kids <strong>18 months - 5 years old.</strong>
                                <br />
                                The <strong>11:30am and 1:00pm</strong> sessions are for kids{' '}
                                <strong>4 - 12 years old.</strong>
                            </p>
                        }
                        style={{ marginBottom: 8 }}
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
                                <Tag color="green">
                                    All day discount: -${PRICE_MAP[appointmentTypeId].DISCOUNT_PRICE}.00
                                </Tag>
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
