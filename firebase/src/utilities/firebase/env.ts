export function getBaseUrl() {
    return process.env.REACT_APP_ENV === 'prod'
        ? 'https://bookings.fizzkidz.com.au'
        : 'https://booking-system-6435d.web.app'
}
