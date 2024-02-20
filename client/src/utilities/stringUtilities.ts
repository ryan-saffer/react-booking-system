export function capitalise(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

export function formatMobileNumber(mobile: string) {
    return mobile.startsWith('61') ? `+${mobile}` : mobile.charAt(0) !== '0' ? `0${mobile}` : mobile
}

export function generateRandomString(length: number) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    let randomString = ''
    for (let i = 0; i < length; i++) {
        randomString += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return randomString
}
