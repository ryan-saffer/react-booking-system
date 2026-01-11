import { useLocation } from 'react-router-dom'

export function useRouterState<T>() {
    const { state } = useLocation()
    return state as T | null
}
