export function isUsingEmulator() {
    return process.env.FUNCTIONS_EMULATOR === 'true'
}
