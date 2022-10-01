import { useState, useEffect } from 'react'

// https://stackoverflow.com/a/36862446/7870403

function getWindowDimensions() {
    const { outerWidth: width, outerWidth: height } = window
    return {
        width,
        height,
    }
}

export default function useWindowDimensions() {
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions())

    useEffect(() => {
        function handleResize() {
            setWindowDimensions(getWindowDimensions())
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return windowDimensions
}
