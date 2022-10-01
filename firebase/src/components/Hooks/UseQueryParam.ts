export default function useQueryParam<T>(
    param: Extract<keyof T, string>,
    queryString: string = window.location.search
): string {
    const urlSearchParams = new URLSearchParams(queryString)
    const result = urlSearchParams.get(param)
    if (result) {
        return result
    } else throw new Error(`query param '${param}' not found`)
}
