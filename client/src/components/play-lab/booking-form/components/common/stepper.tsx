import { Fragment } from 'react'

import { cn } from '@utils/tailwind'

import { useFormStage } from '../../zustand/form-stage'

const steps = [{ title: 'Select Sessions' }, { title: 'Your Details' }, { title: 'Payment' }]

export function Stepper() {
    const formStage = useFormStage((store) => store.formStage)

    const currentStep = formStage === 'program-selection' ? 0 : formStage === 'form' ? 1 : 2

    return (
        <div className="my-6 flex items-center">
            {steps.map((step, idx) => (
                <Fragment key={idx}>
                    {/* Step */}
                    <div className="flex  flex-1 items-center ">
                        <div
                            className={cn(
                                'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-[#AC4390] bg-white text-sm text-[#AC4390] sm:h-8 sm:w-8 sm:text-base',
                                { 'bg-[#AC4390] text-white': currentStep >= idx }
                            )}
                        >
                            {idx + 1}
                        </div>
                        <span className="ml-2 text-sm text-gray-700 sm:text-base">{step.title}</span>
                    </div>

                    {/* Connector (not after last) */}
                    {idx < steps.length - 1 && (
                        <div
                            className={cn('mx-1 h-px flex-1 bg-gray-300 sm:mx-4', {
                                'h-[2px] bg-[#AC4390]': currentStep > idx,
                            })}
                        />
                    )}
                </Fragment>
            ))}
        </div>
    )
}
