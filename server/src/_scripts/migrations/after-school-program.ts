import { FirestoreClient } from '../../firebase/FirestoreClient'

export async function migrateScienceEnrolments() {
    const firestoreClient = await FirestoreClient.getInstance()
    const appointmentsSnap = await firestoreClient.collection('scienceAppointments').get()

    await Promise.all(
        appointmentsSnap.docs.map((doc) => {
            const enrolment = doc.data()
            return firestoreClient
                .collection('afterSchoolEnrolments')
                .doc(doc.id)
                .set({ ...enrolment, type: 'science' })
        })
    )
}
