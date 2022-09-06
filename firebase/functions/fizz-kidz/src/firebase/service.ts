interface ServiceInit {
    status: 'init'
}

interface ServiceLoading {
    status: 'loading'
}

interface ServiceLoaded<T> {
    status: 'loaded'
    result: T
}

interface ServiceError {
    status: 'error'
    error: any
}

export type Service<T> =
    | ServiceInit
    | ServiceLoading
    | ServiceLoaded<T>
    | ServiceError
