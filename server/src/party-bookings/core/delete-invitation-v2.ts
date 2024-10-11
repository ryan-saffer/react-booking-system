import { projectId } from '../../init'
import { StorageClient } from '../../firebase/StorageClient'
import { DatabaseClient } from '../../firebase/DatabaseClient'

export async function deleteInvitationV2(invitationId: string) {
    // delete pdf
    const storage = await StorageClient.getInstance()
    const bucket = storage.bucket(`${projectId}.appspot.com`)
    await bucket.deleteFiles({ prefix: `invitations-v2/${invitationId}` })

    // delete from firestore
    await DatabaseClient.deleteInvitationV2(invitationId)
}
