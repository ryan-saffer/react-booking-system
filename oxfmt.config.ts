import { defineConfig } from 'oxfmt'

export default defineConfig({
    ignorePatterns: [
        'docs/feature-plans/PRESCHOOL_V2_IMPLEMENTATION_PLAN.md',
        'docs/inventory-system-plan.md',
        'scripts/readme.md',
    ],
    trailingComma: 'es5',
    tabWidth: 4,
    semi: false,
    singleQuote: true,
    printWidth: 120,
    bracketSpacing: true,
    sortImports: {
        customGroups: [
            {
                groupName: 'fizz-kidz',
                elementNamePattern: ['fizz-kidz', 'fizz-kidz/**'],
            },
            {
                groupName: 'internal-aliases',
                elementNamePattern: [
                    '@/**',
                    '@components/**',
                    '@ui-components/**',
                    '@constants/**',
                    '@drawables/**',
                    '@utils/**',
                ],
            },
        ],
        groups: [
            'builtin',
            'external',
            'fizz-kidz',
            'internal-aliases',
            ['parent', 'sibling', 'index', 'style', 'side_effect_style'],
            'type',
            'unknown',
        ],
        ignoreCase: true,
        newlinesBetween: true,
    },
    sortPackageJson: false,
    overrides: [
        {
            files: ['client/**/*.{js,jsx,ts,tsx,html}'],
            options: { sortTailwindcss: { config: './client/tailwind.config.js' } },
        },
    ],
})
