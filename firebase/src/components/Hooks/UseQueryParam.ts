export default function useQueryParam<T>(param: Extract<keyof T, string>, queryString: string = window.location.search): string | null {
    const urlSearchParams = new URLSearchParams(queryString)
    return urlSearchParams.get(param)
}