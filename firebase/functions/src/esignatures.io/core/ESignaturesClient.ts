import { env } from '../../init'

const FACILITATOR_CONTRACT_TEMPLATE_ID = 'ae77f4ae-8a4d-438a-82b1-b27d49b45ea9'

export class ESignatureClient {
    async sendContract({
        email,
        mobile,
        templateVariables,
    }: {
        email: string
        mobile: string
        templateVariables: {
            name: string
            position: string
            managerName: string
            managerPosition: string
            address: string
            commencementDate: string
            wage: string
            sendersName: string
            sendersPosition: string
        }
    }) {
        const response = await fetch(`https://esignatures.io/api/contracts?token=${process.env.ESIGNATURES_SECRET}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                template_id: FACILITATOR_CONTRACT_TEMPLATE_ID,
                test: env === 'dev' ? 'yes' : 'no',
                signers: [{ name: templateVariables.name, email, mobile }],
                placeholder_fields: Object.keys(templateVariables).map((api_key) => ({
                    api_key,
                    value: templateVariables[api_key as keyof typeof templateVariables],
                })),
            }),
        })
        return response.json()
    }
}
