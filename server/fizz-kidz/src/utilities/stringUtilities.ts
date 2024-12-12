export function capitalise(input: string) {
    return input.charAt(0).toUpperCase() + input.slice(1)
}

/**
 * Generates a random string that matches firestore id structure.
 *
 * @param length length of the random string to generate @default 20
 * @returns A randomly generated string
 */
export function generateRandomString(length: number = 20) {
    length = length ?? 20
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length)
        result += characters[randomIndex]
    }

    return result
}
