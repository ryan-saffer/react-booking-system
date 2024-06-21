export function getChildNumber(number: number) {
    if (number > 5) {
        return `Child #${number}`
    }
    if (number === 5) {
        return 'Fifth Child'
    }
    if (number === 4) {
        return 'Fourth Child'
    }
    if (number === 3) {
        return 'Third Child'
    }
    if (number === 2) {
        return 'Second Child'
    }
    if (number === 1) {
        return 'First Child'
    }
}
