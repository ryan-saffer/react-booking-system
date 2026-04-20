import { getAuth } from 'firebase-admin/auth'

import { getApplicationDomain } from 'fizz-kidz'

import { env } from '@/init'
import { isUsingEmulator } from '@/utilities'

export async function getPasswordResetLink(email: string) {
    const firebaseResetLink = await getAuth().generatePasswordResetLink(email)
    const oobCode = new URL(firebaseResetLink).searchParams.get('oobCode')

    if (!oobCode) {
        throw new Error(`Could not extract oobCode for password reset email '${email}'.`)
    }

    const resetLink = new URL(`${getApplicationDomain(env, isUsingEmulator())}/reset-password/confirm`)
    resetLink.searchParams.set('oobCode', oobCode)

    return resetLink.toString()
}
