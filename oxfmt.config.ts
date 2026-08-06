import { defineConfig } from 'oxfmt'

export default defineConfig({
    ignorePatterns: ['docs/feature-plans/PRESCHOOL_V2_IMPLEMENTATION_PLAN.md', 'docs/inventory-system-plan.md'],
    trailingComma: 'es5',
    tabWidth: 4,
    semi: false,
    singleQuote: true,
    printWidth: 120,
    bracketSpacing: true,
    sortImports: {
        customGroups: [
            {
                groupName: 'core',
                elementNamePattern: ['@fizz-kidz/**'],
            },
            {
                groupName: 'internal-aliases',
                elementNamePattern: [
                    '@app/**',
                    '@features/**',
                    '@integrations/**',
                    '@server/**',
                    '@session/**',
                    '@shared/**',
                ],
            },
        ],
        groups: [
            'builtin',
            'external',
            'core',
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
            files: ['apps/portal/**/*.{js,jsx,ts,tsx,html}'],
            options: { sortTailwindcss: { config: './apps/portal/tailwind.config.js' } },
        },
        {
            files: ['apps/website/**/*.{astro,html,js,jsx,ts,tsx}'],
            options: { sortTailwindcss: { config: './apps/website/tailwind.config.mjs' } },
        },
        {
            // Indentation is semantically significant in Markdown and MDX: it controls
            // list nesting and paragraph boundaries, including inside JSX children.
            // Re-indenting these files from 2 to 4 spaces silently restructures the
            // rendered page, so they keep the 2-space width the content was authored at.
            files: ['**/*.{md,mdx}'],
            options: { tabWidth: 2 },
        },
    ],
})
