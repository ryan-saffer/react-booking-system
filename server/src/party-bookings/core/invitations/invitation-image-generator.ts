import { createCanvas, loadImage, PNGStream, registerFont } from 'canvas'
import { getApplicationDomain, InvitationOption, InvitationsV2, ObjectKeys, WithoutUid } from 'fizz-kidz'
import fs from 'fs'
import { DateTime } from 'luxon'
import path from 'path'
import QRCode from 'qrcode'
import { env } from '../../../init'

export class InvitationImageGenerator {
    #invitation: WithoutUid<InvitationsV2.Invitation>

    constructor(invitation: WithoutUid<InvitationsV2.Invitation>) {
        this.#invitation = invitation
    }

    /**
     *
     * @param out the output path for the image
     */
    async generatePng(out: string) {
        registerFont(path.resolve(__dirname, './party-bookings/invitations/fonts/lilita-one.ttf'), { family: 'lilita' })
        const image = await loadImage(
            path.resolve(
                __dirname,
                `./party-bookings/invitations/${InvitationInfo[this.#invitation.invitation].filename}`
            )
        )

        const canvas = createCanvas(image.width, image.height)
        const ctx = canvas.getContext('2d')

        ctx.drawImage(image, 0, 0, image.width, image.height)

        ObjectKeys(InvitationInfo[this.#invitation.invitation].textInfo).map((key) => {
            const {
                font,
                textAlign,
                fillStyle,
                coords: { x, y },
            } = InvitationInfo[this.#invitation.invitation].textInfo[key]

            ctx.font = font
            ctx.fillStyle = fillStyle
            ctx.textAlign = textAlign
            ctx.fillText(this.#getContent(key), x, y)
        })

        const qrCodeBuffer = await QRCode.toBuffer(
            `${getApplicationDomain(env)}/invitation/v2/${this.#invitation.id}`,
            { width: 300 }
        )
        const qrCodeImage = await loadImage(qrCodeBuffer)
        console.log({ width: image.width, height: image.height })
        ctx.drawImage(qrCodeImage, image.width - qrCodeImage.width, image.height - qrCodeImage.height)

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

const InvitationInfo: Record<InvitationOption, { filename: string; textInfo: InvitationCoordinates }> = {
    Freckles: {
        filename: 'freckles.png',
        textInfo: {
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
    },
    Stripes: {
        filename: 'stripes.png',
        textInfo: {
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
    },
    Dots: {
        filename: 'dots.png',
        textInfo: {
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
    },
    'Glitz & Glam': {
        filename: 'glitz.png',
        textInfo: {
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
    },
    'Bubbling Fun': {
        filename: 'bubbling.png',
        textInfo: {
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
    },
    'Bubbling Blue Fun': {
        filename: 'bubbling-blue.png',
        textInfo: {
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
    },
    'Slime Time': {
        filename: 'slime.png',
        textInfo: {
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
    },
    Swiftie: {
        filename: 'swift.png',
        textInfo: {
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
    },
    'Tie Dye': {
        filename: 'tie-dye.png',
        textInfo: {
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
    },
}
