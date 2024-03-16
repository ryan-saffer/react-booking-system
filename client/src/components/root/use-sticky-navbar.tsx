import { useEffect } from 'react'

/**
 * Use this hook in a component where you want to make the navbar sticky.
 */
export function useStickyNavbar() {
    useEffect(() => {
        const navbar = document.getElementById('navbar') as HTMLElement
        navbar.classList.add('sticky', 'top-0')

        return () => {
            const navbar = document.getElementById('navbar') as HTMLElement
            navbar.classList.remove('sticky', 'top-0')
        }
    }, [])
}
