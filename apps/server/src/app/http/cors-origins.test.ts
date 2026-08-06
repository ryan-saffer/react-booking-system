import { strictEqual } from 'node:assert'

import { describe, it } from 'vite-plus/test'

import { isApiCorsOriginAllowed } from './cors-origins'

describe('API CORS origins', () => {
    it('allows Fizz Kidz production and development origins', () => {
        strictEqual(isApiCorsOriginAllowed('https://www.fizzkidz.com.au'), true)
        strictEqual(isApiCorsOriginAllowed('https://bookings.fizzkidz.com.au'), true)
        strictEqual(isApiCorsOriginAllowed('https://dev.fizzkidz.com.au'), true)
    })

    it('allows Firebase Hosting, Netlify, and local development origins', () => {
        strictEqual(isApiCorsOriginAllowed('https://bookings-prod.web.app'), true)
        strictEqual(isApiCorsOriginAllowed('https://deploy-preview-42--fizz-kidz.netlify.app'), true)
        strictEqual(isApiCorsOriginAllowed('http://localhost:4321'), true)
        strictEqual(isApiCorsOriginAllowed('http://127.0.0.1:3000'), true)
    })

    it('rejects unrelated browser origins', () => {
        strictEqual(isApiCorsOriginAllowed('https://example.com'), false)
        strictEqual(isApiCorsOriginAllowed('http://fizzkidz.com.au.example.com'), false)
    })
})
