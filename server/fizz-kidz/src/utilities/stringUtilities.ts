export function capitalise(input: string) {
    return input.charAt(0).toUpperCase() + input.slice(1)
}

export function addOrdinalSuffix(input: string) {
    const split = input.split(' ')
    const lastPart = split[split.length - 1]
    if (!/^\d+$/.test(lastPart)) {
        // if unsure, just return 'th' at the end
        return `${input}th`
    }

    const number = parseInt(lastPart)

    const suffixes = ['th', 'st', 'nd', 'rd']
    const v = number % 100

    if (v >= 11 && v <= 13) {
        return `${number}th`
    }

    const lastDigit = number % 10
    const suffix = suffixes[lastDigit] || suffixes[0]
    return `${input}${suffix}`
}
