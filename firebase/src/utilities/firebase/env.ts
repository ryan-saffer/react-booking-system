export function getBaseUrl() {
    return process.env.REACT_APP_ENV === 'prod' ? 'https://bookings.fizzkidz.com.au' : 'https://dev.fizzkidz.com.au'
}
