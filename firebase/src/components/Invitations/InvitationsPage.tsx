import { Invitation } from 'fizz-kidz'
import React, { useState } from 'react'
import { callFirebaseFunction } from '../../utilities/firebase/functions'
import useFirebase from '../Hooks/context/UseFirebase'

const InvitationsPage = () => {
    const firebase = useFirebase()

    const [childName, setChildName] = useState('')
    const [date, setDate] = useState('')
    const [time, setTime] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const result = await callFirebaseFunction(
            'downloadInvitation',
            firebase
        )({
            childName,
            childAge: '8',
            date,
            time,
            rsvp: '20/01/23',
            invitation: Invitation.Freckles,
        })

        const url = await firebase.storage.ref().child(result.data).getDownloadURL()

        window.location.href = url
    }

    return (
        <>
            <h1>Invitations</h1>
            <form onSubmit={handleSubmit}>
                <label>Child Name:</label>
                <input value={childName} onChange={(e) => setChildName(e.target.value)} />
                <label>Date:</label>
                <input value={date} onChange={(e) => setDate(e.target.value)} />
                <label>Time:</label>
                <input value={time} onChange={(e) => setTime(e.target.value)} />
                <button type="submit">Generate invitation</button>
            </form>
        </>
    )
}

export default InvitationsPage
