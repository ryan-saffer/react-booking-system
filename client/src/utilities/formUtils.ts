export const SimpleTextRule = {
    pattern: /^[a-zA-Z0-9 -]+$/,
    message: 'No special characters allowed.',
}

export const PhoneRule = {
    pattern: /^[0-9]+$/,
    message: 'Only numbers 0-9 allowed',
}
