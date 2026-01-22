/** @type {import('eslint').Linter.Config} */
module.exports = {
    plugins: ['import'],
    rules: {
        // Let eslint-plugin-import handle duplicates instead
        'no-duplicate-imports': 'off',
        'import/no-duplicates': 'off',

        // Auto-separate value imports from type imports
        '@typescript-eslint/consistent-type-imports': [
            'error',
            {
                prefer: 'type-imports',
                fixStyle: 'separate-type-imports',
            },
        ],

        // Import ordering: externals -> fizz-kidz -> internal aliases -> locals
        'import/order': [
            'error',
            {
                groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index'], 'type'],

                pathGroups: [
                    {
                        pattern: 'fizz-kidz',
                        group: 'external',
                        position: 'after',
                    },
                    {
                        // Server TS path alias: `@/*`
                        pattern: '@/**',
                        group: 'internal',
                        position: 'after',
                    },
                    {
                        // Client TS path aliases: `@components/*`, etc
                        pattern: '@{components,ui-components,constants,drawables,utils}/**',
                        group: 'internal',
                        position: 'after',
                    },
                ],

                pathGroupsExcludedImportTypes: ['builtin'],
                'newlines-between': 'always',

                alphabetize: {
                    order: 'asc',
                    caseInsensitive: true,
                },
            },
        ],
    },
}
