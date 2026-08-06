import { createTRPCClient, httpLink } from '@trpc/client'

import type { AppRouter } from '@server/app/trpc/app.trpc'

const environment = import.meta.env.MODE === 'prod' ? 'prod' : 'dev'
const serverBaseUrl =
    import.meta.env.MODE === 'emulator'
        ? 'http://localhost:5001/booking-system-6435d/australia-southeast1/api'
        : environment === 'prod'
          ? 'https://bookings.fizzkidz.com.au'
          : 'https://dev.fizzkidz.com.au'

export const trpc = createTRPCClient<AppRouter>({
    links: [
        httpLink({
            url: `${serverBaseUrl}/api/trpc`,
        }),
    ],
})
