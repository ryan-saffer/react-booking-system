export default function useQueryParam<T>(param: Extract<keyof T, string>): string | null {
    const urlSearchParams = new URLSearchParams(window.location.search)
    return urlSearchParams.get(param)
}