import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'

import { ErrorScreen } from '@components/root/error-page'
import Loader from '@components/Shared/Loader'
import { useTRPC } from '@utils/trpc'

const QUERY_PAPERFORMS = {
    'incident-reporting': { paperformId: 'pyornlcz' },
    onboarding: { paperformId: 'fizz-kidz-onboarding' },
    incursion: { paperformId: 'dtrdgb8b' },
    'staff-feedback': { paperformId: 'b55fbq3h' },
} as const

const SERVER_PAPERFORMS = {
    party: { partyOrCakeForm: 'party' },
    cake: { partyOrCakeForm: 'cake' },
} as const

type QueryPaperformKey = keyof typeof QUERY_PAPERFORMS
type ServerPaperformKey = keyof typeof SERVER_PAPERFORMS
type HostedPaperformKey = QueryPaperformKey | ServerPaperformKey

function isHostedPaperformKey(value: string | null): value is HostedPaperformKey {
    return Boolean(value && (value in QUERY_PAPERFORMS || value in SERVER_PAPERFORMS))
}

function getHostedPaperformKey(searchParams: URLSearchParams): HostedPaperformKey | null {
    const form = searchParams.get('form')
    if (isHostedPaperformKey(form)) {
        return form
    }

    return null
}

function getQueryPrefill(searchParams: URLSearchParams) {
    const params = new URLSearchParams(searchParams)
    params.delete('form')
    return params.toString()
}

export const Paperform = () => {
    const trpc = useTRPC()
    const [searchParams] = useSearchParams()
    const paperformRef = useRef<HTMLDivElement | null>(null)

    const bookingId = searchParams.get('id')
    const form = getHostedPaperformKey(searchParams)
    const isServerPaperform = form === 'party' || form === 'cake'

    const embedConfigQuery = useQuery(
        trpc.parties.getPaperformEmbedConfig.queryOptions(
            {
                bookingId: bookingId || '',
                partyOrCakeForm: isServerPaperform ? SERVER_PAPERFORMS[form].partyOrCakeForm : 'party',
            },
            { enabled: Boolean(bookingId) && isServerPaperform }
        )
    )

    const queryPaperformConfig = form && form in QUERY_PAPERFORMS ? QUERY_PAPERFORMS[form as QueryPaperformKey] : null
    const resolvedEmbedConfig = isServerPaperform
        ? embedConfigQuery.data || null
        : queryPaperformConfig
          ? {
                paperformId: queryPaperformConfig.paperformId,
                prefill: getQueryPrefill(searchParams),
            }
          : null

    useEffect(() => {
        const prefill = resolvedEmbedConfig?.prefill
        const paperformId = resolvedEmbedConfig?.paperformId
        const node = paperformRef.current
        if (!paperformId || !node) {
            return
        }

        node.setAttribute('data-paperform-id', paperformId)
        node.setAttribute('spinner', '1')
        if (prefill) {
            node.setAttribute('prefill', prefill)
        } else {
            node.removeAttribute('prefill')
        }

        const script = document.createElement('script')
        script.src = 'https://paperform.co/__embed.min.js'
        script.async = true

        document.body.appendChild(script)

        return () => {
            script.remove()
        }
    }, [resolvedEmbedConfig?.paperformId, resolvedEmbedConfig?.prefill])

    if (!form) {
        return (
            <ErrorScreen
                showGoHome={false}
                label="Invalid form link"
                text="This form link is missing information or is no longer available."
            />
        )
    }

    if (isServerPaperform && !bookingId) {
        return (
            <ErrorScreen
                showGoHome={false}
                label="Invalid form link"
                text="This form link is missing information or is no longer available."
            />
        )
    }

    if (isServerPaperform && embedConfigQuery.isPending) {
        return <Loader fullScreen />
    }

    if ((isServerPaperform && embedConfigQuery.isError) || !resolvedEmbedConfig) {
        return (
            <ErrorScreen
                showRefresh
                showGoHome={false}
                label="Unable to load form"
                text="We couldn't load this form right now. Please refresh and try again, or contact us if the problem continues."
            />
        )
    }

    return <div key={`${form}:${resolvedEmbedConfig.prefill}`} ref={paperformRef} data-takeover="1"></div>
}
