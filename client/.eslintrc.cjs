module.exports = {
    root: true,
    env: { browser: true, es2020: true },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react-hooks/recommended',
        '../eslint.shared.cjs',
    ],
    ignorePatterns: ['dist', '.eslintrc.cjs', 'vite.config.d.ts'],
    parser: '@typescript-eslint/parser',
    plugins: ['react-refresh', 'import'],
    rules: {
        'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
        '@typescript-eslint/no-explicit-any': 'off',
    },
}
