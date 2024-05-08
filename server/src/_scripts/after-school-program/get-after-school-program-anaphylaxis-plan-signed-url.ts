import { getStorage } from 'firebase-admin/storage'

import { DatabaseClient } from '../../firebase/DatabaseClient'
import { projectId } from '../../init'

export async function getAfterSchoolProgramAnaphylaxisPlanSignedUrl(enrolmentId: string) {
    const bucket = getStorage().bucket(`${projectId}.appspot.com`)

    const [files] = await bucket.getFiles({ prefix: `anaphylaxisPlans/${enrolmentId}` })
    const file = files.find((it) => it.name.endsWith('.pdf'))

    if (!file) {
        throw new Error('No files found for given enrolment id')
    }

    const today = new Date()
    const [signedUrl] = await file.getSignedUrl({
        version: 'v2',
        action: 'read',
        expires: new Date(today.setMonth(today.getMonth() + 6)), // expires in 6 months
    })

    await DatabaseClient.updateAfterSchoolEnrolment(enrolmentId, { child: { anaphylaxisPlan: signedUrl } })
}
