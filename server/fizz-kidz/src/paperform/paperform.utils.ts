import { OnboardingForm, PartyForm } from '.'

type PaperForm = PartyForm | OnboardingForm

type PaperFormQuestion<TForm extends PaperForm, T extends keyof TForm = keyof TForm> = {
    title: string
    description: string
    key: string
    custom_key: T
    value: TForm[T]
}

export type PaperFormResponse<TForm extends PaperForm> = PaperFormQuestion<TForm>[]

export function getQuestionValue<TPaperForm extends PaperForm, T extends keyof TPaperForm = keyof TPaperForm>(
    responses: PaperFormResponse<TPaperForm>,
    question: T
) {
    const response = responses.find((it): it is PaperFormQuestion<TPaperForm, T> => it.custom_key === question)

    if (response) {
        return response.value
    } else {
        throw new Error(`IllegalArgumentError: No such key ${question.toString()}`)
    }
}
