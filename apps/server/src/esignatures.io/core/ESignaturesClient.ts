import { env } from '../../init'

const PARTY_FACILITATOR_CONTRACT_TEMPLATE_ID = 'ae77f4ae-8a4d-438a-82b1-b27d49b45ea9'
const AREA_MANAGER_CONTRACT_TEMPLATE_ID = 'd6aecbf5-6842-4144-9968-f8f6714dc50b'

type BaseCreateContractParams = {
    id: string
    email: string
    mobile: string
}

type CreatePartyFacilitatorContractParams = BaseCreateContractParams & {
    templateVariables: PartyFacilitatorContractTemplateVariables
}

type CreateAreaManagerContractParams = BaseCreateContractParams & {
    templateVariables: AreaManagerContractTemplateVariables
}

type ESignaturesContractTemplateVariables = {
    name: string
    [apiKey: string]: string | number
}

type PartyFacilitatorContractTemplateVariables = ESignaturesContractTemplateVariables & {
    position: string
    managerName: string
    managerPosition: string
    address: string
    commencementDate: string
    normalRate: number
    sundayRate: number
    senderName: string
    senderPosition: string
}

type AreaManagerContractTemplateVariables = {
    name: string
    position: string
    commencementDate: string
    hoursPerWeek: string
    annualSalary: string
    [apiKey: string]: string | number
}

type ESignaturesCreateContractResponse = {
    data: {
        contract: {
            id: string
            signers: {
                sign_page_url: string
            }[]
        }
    }
}

export class ESignatureClient {
    createPartyFacilitatorContract(params: CreatePartyFacilitatorContractParams) {
        return this.#createContract(PARTY_FACILITATOR_CONTRACT_TEMPLATE_ID, params)
    }

    createAreaManagerContract(params: CreateAreaManagerContractParams) {
        return this.#createContract(AREA_MANAGER_CONTRACT_TEMPLATE_ID, params)
    }

    async #createContract<TTemplateVariables extends ESignaturesContractTemplateVariables>(
        templateId: string,
        { id, email, mobile, templateVariables }: BaseCreateContractParams & { templateVariables: TTemplateVariables }
    ) {
        const result = await this.#postContract({
            template_id: templateId,
            test: env === 'dev' ? 'yes' : 'no',
            metadata: id,
            signers: [
                {
                    name: templateVariables.name,
                    email,
                    mobile,
                    required_identification_methods: ['email'],
                    signature_request_delivery_method: '',
                    signed_document_delivery_method: 'email',
                },
            ],
            placeholder_fields: Object.entries(templateVariables).map(([api_key, value]) => ({
                api_key,
                value,
            })),
        })

        return {
            contractId: result.data.contract.id,
            contractSignUrl: result.data.contract.signers[0].sign_page_url,
        }
    }

    async #postContract(body: {
        template_id: string
        test: 'yes' | 'no'
        metadata: string
        signers: {
            name: string
            email: string
            mobile: string
            required_identification_methods: string[]
            signature_request_delivery_method: string
            signed_document_delivery_method: string
        }[]
        placeholder_fields: {
            api_key: string
            value: string | number
        }[]
    }) {
        const response = await fetch(`https://esignatures.io/api/contracts?token=${process.env.ESIGNATURES_SECRET}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        })

        if (!response.ok) {
            throw new Error(`eSignatures contract request failed with ${response.status} ${response.statusText}`)
        }

        return (await response.json()) as ESignaturesCreateContractResponse
    }
}
