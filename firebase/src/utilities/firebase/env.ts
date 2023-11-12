export function getBaseUrl() {
    return import.meta.env.VITE_ENV === 'prod' ? 'https://bookings.fizzkidz.com.au' : 'https://dev.fizzkidz.com.au'
}
