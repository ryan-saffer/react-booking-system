import { isRouteErrorResponse, useRouteError } from 'react-router-dom'

import { ErrorScreen } from './error-page'

export function _404() {
    const error = useRouteError()

    if (isRouteErrorResponse(error)) {
        if (error.status === 404) {
            return <ErrorScreen label="404" text="Sorry, we couldn't find what you were looking for!" />
        }
    }

    return <ErrorScreen showRefresh label="Something went wrong" text="Sorry, something broke. Try refreshing the page." />
}
