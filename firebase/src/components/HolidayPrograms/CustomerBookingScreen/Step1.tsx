import React, { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react'
import { Form, Checkbox, Select, FormInstance } from 'antd'
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { Acuity, Locations } from 'fizz-kidz'
import { DateTime } from 'luxon'
import { capitalise } from '../../../utilities/stringUtilities'
const { Option } = Select

type Props = {
    classes: Acuity.Class[]
    selectedStore: string
    setSelectedStore: Dispatch<SetStateAction<string>>
    onClassSelectionChange: (e: CheckboxChangeEvent) => void
}

const Step1: React.FC<Props> = ({ classes, selectedStore, setSelectedStore, onClassSelectionChange }) => {

    const [filteredClasses, setFilteredClasses] = useState<Acuity.Class[]>()

    useEffect(() => {
        if (selectedStore !== '') {
            setFilteredClasses(classes?.filter(it => it.calendar.toLowerCase().includes(selectedStore)))
        }
    }, [selectedStore])

    return (
        <>
            <Form.Item name="store" label="Which store do you want to book for?">
                <Select value={selectedStore} onChange={store => setSelectedStore(store)}>
                    {(() => {
                        if(process.env.REACT_APP_ENV === 'prod') {
                            return Object.values(Locations).map(location => {
                                if (location !== Locations.MOBILE) {
                                    return <Option value={location} key={location}>{capitalise(location)}</Option>
                                }
                            })
                        } else {
                            return <Option value="test" key="test">Test</Option>
                        }
                    })()}
                </Select>
            </Form.Item>
            {filteredClasses?.map(klass => {
                let name = `${klass.id}-checkbox`
                return (
                    <Form.Item key={klass.id} name={name} valuePropName='checked'>
                        <Checkbox
                            value={klass.id}
                            disabled={klass.slotsAvailable === 0}
                            onChange={onClassSelectionChange}
                        >
                            {DateTime.fromISO(klass.time).toLocaleString({
                                weekday: 'long',
                                month: 'short',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                            })}
                            {klass.slotsAvailable > 0 ? ` [${klass.slotsAvailable} spot/s left]` : ' [No spots left]'}
                        </Checkbox>
                    </Form.Item>
                )
            })}
        </>
    )
}

export default Step1