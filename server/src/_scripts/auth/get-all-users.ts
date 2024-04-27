import { getAuth } from 'firebase-admin/auth'

export async function getAllUsers() {
    const users = await getAuth().listUsers()

    users.users.map((user) => console.log({ user }))
}
