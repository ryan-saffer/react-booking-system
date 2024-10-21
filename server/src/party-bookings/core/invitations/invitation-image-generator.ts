import { createCanvas, loadImage, PNGStream, registerFont } from 'canvas'
import { InvitationOption, InvitationsV2, ObjectKeys, WithoutId, WithoutUid } from 'fizz-kidz'
import fs from 'fs'
import { DateTime } from 'luxon'
import path from 'path'

export class InvitationImageGenerator {
    #invitation: WithoutId<WithoutUid<InvitationsV2.Invitation>>

    constructor(invitation: WithoutId<WithoutUid<InvitationsV2.Invitation>>) {
        this.#invitation = invitation
    }

    /**
     *
     * @param out the output path for the image
     */
    async generatePng(out: string) {
        registerFont(path.resolve(__dirname, './party-bookings/invitations/fonts/lilita-one.ttf'), { family: 'lilita' })
        const image = await loadImage(path.resolve(__dirname, './party-bookings/invitations/invitation-test.png'))

        const canvas = createCanvas(image.width, image.height)
        const ctx = canvas.getContext('2d')

        ctx.drawImage(image, 0, 0, image.width, image.height)

        ObjectKeys(INVITATION_TEXT_INFO[this.#invitation.invitation]).map((key) => {
            const {
                font,
                textAlign,
                fillStyle,
                coords: { x, y },
            } = INVITATION_TEXT_INFO[this.#invitation.invitation][key]

            ctx.font = font
            ctx.fillStyle = fillStyle
            ctx.textAlign = textAlign
            ctx.fillText(this.#getContent(key), x, y)
        })

        const stream = canvas.createPNGStream()
        const outputStream = fs.createWriteStream(out)

        return this.#asyncStream(stream, outputStream)
    }

    #asyncStream(stream: PNGStream, out: fs.WriteStream) {
        return new Promise<void>((resolve, reject) => {
            stream.pipe(out)
            out.on('finish', () => {
                resolve()
            })
            out.on('error', () => reject('error writing canvas to png'))
        })
    }

    #getContent(field: keyof InvitationCoordinates) {
        switch (field) {
            case 'childName': {
                return `${this.#invitation.childName}'s ${this.#invitation.childAge}th`
            }
            case 'date': {
                return DateTime.fromJSDate(this.#invitation.date, { zone: 'Australia/Melbourne' }).toFormat(
                    'dd/LL/yyyy'
                )
            }
            default: {
                const exhaustiveCheck: never = field
                throw new Error(`Unhandled field when getting invitation content for field: '${exhaustiveCheck}'`)
            }
        }
    }
}

type Coords = { x: number; y: number }

type TextInfo = {
    font: string
    textAlign: 'left' | 'center'
    fillStyle: string
    coords: Coords
}

type InvitationCoordinates = {
    childName: TextInfo
    date: TextInfo
}

const INVITATION_TEXT_INFO: Record<InvitationOption, InvitationCoordinates> = {
    Freckles: {
        childName: {
            font: '120px lilita',
            textAlign: 'center',
            fillStyle: '#ABC954',
            coords: { x: 740, y: 1060 },
        },
        date: {
            font: 'bold 40px Open Sans Condensed Light',
            fillStyle: 'black',
            textAlign: 'left',
            coords: { x: 482, y: 1345 },
        },
    },
    Stripes: {
        childName: {
            font: '120px lilita',
            textAlign: 'center',
            fillStyle: '#ABC954',
            coords: { x: 740, y: 1060 },
        },
        date: {
            font: 'bold 40px Open Sans Condensed Light',
            fillStyle: 'black',
            textAlign: 'left',
            coords: { x: 482, y: 1345 },
        },
    },
    Dots: {
        childName: {
            font: '120px lilita',
            textAlign: 'center',
            fillStyle: '#ABC954',
            coords: { x: 740, y: 1060 },
        },
        date: {
            font: 'bold 40px Open Sans Condensed Light',
            fillStyle: 'black',
            textAlign: 'left',
            coords: { x: 482, y: 1345 },
        },
    },
    'Glitz & Glam': {
        childName: {
            font: '120px lilita',
            textAlign: 'center',
            fillStyle: '#ABC954',
            coords: { x: 740, y: 1060 },
        },
        date: {
            font: 'bold 40px Open Sans Condensed Light',
            fillStyle: 'black',
            textAlign: 'left',
            coords: { x: 482, y: 1345 },
        },
    },
    'Bubbling Fun': {
        childName: {
            font: '120px lilita',
            textAlign: 'center',
            fillStyle: '#ABC954',
            coords: { x: 740, y: 1060 },
        },
        date: {
            font: 'bold 40px Open Sans Condensed Light',
            fillStyle: 'black',
            textAlign: 'left',
            coords: { x: 482, y: 1345 },
        },
    },
    'Bubbling Blue Fun': {
        childName: {
            font: '120px lilita',
            textAlign: 'center',
            fillStyle: '#ABC954',
            coords: { x: 740, y: 1060 },
        },
        date: {
            font: 'bold 40px Open Sans Condensed Light',
            fillStyle: 'black',
            textAlign: 'left',
            coords: { x: 482, y: 1345 },
        },
    },
    'Slime Time': {
        childName: {
            font: '120px lilita',
            textAlign: 'center',
            fillStyle: '#ABC954',
            coords: { x: 740, y: 1060 },
        },
        date: {
            font: 'bold 40px Open Sans Condensed Light',
            fillStyle: 'black',
            textAlign: 'left',
            coords: { x: 482, y: 1345 },
        },
    },
    'Tie Dye': {
        childName: {
            font: '120px lilita',
            textAlign: 'center',
            fillStyle: '#ABC954',
            coords: { x: 740, y: 1060 },
        },
        date: {
            font: 'bold 40px Open Sans Condensed Light',
            fillStyle: 'black',
            textAlign: 'left',
            coords: { x: 482, y: 1345 },
        },
    },
    Swiftie: {
        childName: {
            font: '120px lilita',
            textAlign: 'center',
            fillStyle: '#ABC954',
            coords: { x: 740, y: 1060 },
        },
        date: {
            font: 'bold 40px Open Sans Condensed Light',
            fillStyle: 'black',
            textAlign: 'left',
            coords: { x: 482, y: 1345 },
        },
    },
}
