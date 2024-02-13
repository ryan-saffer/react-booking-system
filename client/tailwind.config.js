/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        fontFamily: {
            lilita: ['LilitaOne'],
            gotham: ['GothamLight'],
            extend: {},
        },
        extend: {
            boxShadow: {
                purple: '-28px 24px 0px -1px rgba(232,219,253,0.81)',
            },
        },
        plugins: [],
    },
}
