export default function useQueryParam<T>(
    param: Extract<keyof T, string>,
    required: boolean = true,
    queryString: string = window.location.search
): string | null {
    const urlSearchParams = new URLSearchParams(queryString)
    const result = urlSearchParams.get(param)
    if (result) {
        return result
    } else if (!required) {
        return null
    } else throw new Error(`query param '${param}' not found`)
}
