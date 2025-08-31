import * as React from 'react'
import { type VariantProps } from 'class-variance-authority'

import { badgeVariants } from './badge-variants'
import { cn } from '@utils/tailwind'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
    return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge }
