import fs from 'fs'
import path from 'path'

import type { PNGStream } from 'canvas'
import { createCanvas, loadImage, registerFont } from 'canvas'
import type { InvitationsV2, WithoutUid } from 'fizz-kidz'
import { ObjectKeys, getCloudFunctionsDomain, getLocationAddress } from 'fizz-kidz'
import { DateTime } from 'luxon'
import QRCode from 'qrcode'

import { env } from '@/init'

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
            `${getCloudFunctionsDomain(env, process.env.FUNCTIONS_EMULATOR === 'true')}/invitation/${
                this.#invitation.bookingId
            }`,
            { width: 300 }
        )
        const qrCodeImage = await loadImage(qrCodeBuffer)
        const qrCodePosition = InvitationInfo[this.#invitation.invitation].qrCodePosition
        ctx.drawImage(
            qrCodeImage,
            image.width - qrCodeImage.width,
            qrCodePosition === 'bottom' ? image.height - qrCodeImage.height : 0
        )

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
            out.on('error', (err: any) => {
                console.error({ err })
                reject('error writing canvas to png')
            })
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
            case 'time': {
                return this.#invitation.time
            }
            case 'rsvpLine1': {
                return `${this.#invitation.parentName} on ${this.#invitation.parentMobile}`
            }
            case 'rsvpLine2': {
                return `by ${DateTime.fromJSDate(this.#invitation.rsvpDate, { zone: 'Australia/Melbourne' }).toFormat(
                    'dd/LL/yyyy'
                )}`
            }
            case 'address': {
                return this.#invitation.$type === 'studio'
                    ? getLocationAddress(this.#invitation.studio)
                    : this.#invitation.address
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
    time: TextInfo
    rsvpLine1: TextInfo
    rsvpLine2: TextInfo
    address: TextInfo
}

const InvitationInfo: Record<
    InvitationsV2.InvitationOption,
    { filename: string; textInfo: InvitationCoordinates; qrCodePosition: 'top' | 'bottom' }
> = {
    Freckles: {
        filename: 'freckles.png',
        qrCodePosition: 'bottom',
        textInfo: {
            childName: {
                font: '120px lilita',
                textAlign: 'center',
                fillStyle: '#ABC954',
                coords: { x: 700, y: 970 },
            },
            date: {
                font: 'bold 40px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'left',
                coords: { x: 462, y: 1273 },
            },
            time: {
                font: 'bold 40px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'left',
                coords: { x: 832, y: 1273 },
            },
            rsvpLine1: {
                font: 'bold 40px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'left',
                coords: { x: 522, y: 1398 },
            },
            rsvpLine2: {
                font: 'bold 40px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'left',
                coords: { x: 560, y: 1453 },
            },
            address: {
                font: '34px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'center',
                coords: { x: 700, y: 1755 },
            },
        },
    },
    Stripes: {
        filename: 'stripes.png',
        qrCodePosition: 'bottom',
        textInfo: {
            childName: {
                font: '120px lilita',
                textAlign: 'center',
                fillStyle: '#ABC954',
                coords: { x: 705, y: 868 },
            },
            date: {
                font: 'bold 40px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'left',
                coords: { x: 458, y: 1185 },
            },
            time: {
                font: 'bold 40px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'left',
                coords: { x: 833, y: 1185 },
            },
            rsvpLine1: {
                font: 'bold 40px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'left',
                coords: { x: 530, y: 1293 },
            },
            rsvpLine2: {
                font: 'bold 40px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'left',
                coords: { x: 568, y: 1348 },
            },
            address: {
                font: '34px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'center',
                coords: { x: 705, y: 1628 },
            },
        },
    },
    Dots: {
        filename: 'dots.png',
        qrCodePosition: 'top',
        textInfo: {
            childName: {
                font: '120px lilita',
                textAlign: 'center',
                fillStyle: '#ABC954',
                coords: { x: 705, y: 860 },
            },
            date: {
                font: 'bold 40px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'left',
                coords: { x: 423, y: 1141 },
            },
            time: {
                font: 'bold 40px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'left',
                coords: { x: 817, y: 1141 },
            },
            rsvpLine1: {
                font: 'bold 40px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'left',
                coords: { x: 520, y: 1264 },
            },
            rsvpLine2: {
                font: 'bold 40px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'left',
                coords: { x: 558, y: 1319 },
            },
            address: {
                font: '34px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'center',
                coords: { x: 877, y: 1781 },
            },
        },
    },
    'Glitz & Glam': {
        filename: 'glitz.png',
        qrCodePosition: 'bottom',
        textInfo: {
            childName: {
                font: '120px lilita',
                textAlign: 'center',
                fillStyle: '#ABC954',
                coords: { x: 705, y: 860 },
            },
            date: {
                font: 'bold 40px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'left',
                coords: { x: 423, y: 1141 },
            },
            time: {
                font: 'bold 40px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'left',
                coords: { x: 817, y: 1141 },
            },
            rsvpLine1: {
                font: 'bold 40px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'left',
                coords: { x: 520, y: 1264 },
            },
            rsvpLine2: {
                font: 'bold 40px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'left',
                coords: { x: 558, y: 1319 },
            },
            address: {
                font: '34px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'center',
                coords: { x: 877, y: 1781 },
            },
        },
    },
    'Bubbling Fun': {
        filename: 'bubbling.png',
        qrCodePosition: 'bottom',
        textInfo: {
            childName: {
                font: '120px lilita',
                textAlign: 'center',
                fillStyle: '#ABC954',
                coords: { x: 705, y: 860 },
            },
            date: {
                font: 'bold 40px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'left',
                coords: { x: 423, y: 1141 },
            },
            time: {
                font: 'bold 40px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'left',
                coords: { x: 817, y: 1141 },
            },
            rsvpLine1: {
                font: 'bold 40px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'left',
                coords: { x: 520, y: 1264 },
            },
            rsvpLine2: {
                font: 'bold 40px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'left',
                coords: { x: 558, y: 1319 },
            },
            address: {
                font: '34px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'center',
                coords: { x: 877, y: 1781 },
            },
        },
    },
    'Bubbling Blue Fun': {
        filename: 'bubbling-blue.png',
        qrCodePosition: 'bottom',
        textInfo: {
            childName: {
                font: '120px lilita',
                textAlign: 'center',
                fillStyle: '#ABC954',
                coords: { x: 705, y: 860 },
            },
            date: {
                font: 'bold 40px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'left',
                coords: { x: 423, y: 1141 },
            },
            time: {
                font: 'bold 40px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'left',
                coords: { x: 817, y: 1141 },
            },
            rsvpLine1: {
                font: 'bold 40px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'left',
                coords: { x: 520, y: 1264 },
            },
            rsvpLine2: {
                font: 'bold 40px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'left',
                coords: { x: 558, y: 1319 },
            },
            address: {
                font: '34px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'center',
                coords: { x: 877, y: 1781 },
            },
        },
    },
    'Slime Time': {
        filename: 'slime.png',
        qrCodePosition: 'bottom',
        textInfo: {
            childName: {
                font: '120px lilita',
                textAlign: 'center',
                fillStyle: '#ABC954',
                coords: { x: 705, y: 860 },
            },
            date: {
                font: 'bold 40px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'left',
                coords: { x: 423, y: 1141 },
            },
            time: {
                font: 'bold 40px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'left',
                coords: { x: 817, y: 1141 },
            },
            rsvpLine1: {
                font: 'bold 40px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'left',
                coords: { x: 520, y: 1264 },
            },
            rsvpLine2: {
                font: 'bold 40px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'left',
                coords: { x: 558, y: 1319 },
            },
            address: {
                font: '34px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'center',
                coords: { x: 877, y: 1781 },
            },
        },
    },
    Swiftie: {
        filename: 'swift.png',
        qrCodePosition: 'bottom',
        textInfo: {
            childName: {
                font: '120px lilita',
                textAlign: 'center',
                fillStyle: '#ABC954',
                coords: { x: 705, y: 860 },
            },
            date: {
                font: 'bold 40px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'left',
                coords: { x: 423, y: 1141 },
            },
            time: {
                font: 'bold 40px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'left',
                coords: { x: 817, y: 1141 },
            },
            rsvpLine1: {
                font: 'bold 40px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'left',
                coords: { x: 520, y: 1264 },
            },
            rsvpLine2: {
                font: 'bold 40px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'left',
                coords: { x: 558, y: 1319 },
            },
            address: {
                font: '34px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'center',
                coords: { x: 877, y: 1781 },
            },
        },
    },
    'Tie Dye': {
        filename: 'tie-dye.png',
        qrCodePosition: 'bottom',
        textInfo: {
            childName: {
                font: '120px lilita',
                textAlign: 'center',
                fillStyle: '#ABC954',
                coords: { x: 705, y: 860 },
            },
            date: {
                font: 'bold 40px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'left',
                coords: { x: 423, y: 1141 },
            },
            time: {
                font: 'bold 40px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'left',
                coords: { x: 817, y: 1141 },
            },
            rsvpLine1: {
                font: 'bold 40px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'left',
                coords: { x: 520, y: 1264 },
            },
            rsvpLine2: {
                font: 'bold 40px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'left',
                coords: { x: 558, y: 1319 },
            },
            address: {
                font: '34px Open Sans Condensed Light',
                fillStyle: 'black',
                textAlign: 'center',
                coords: { x: 877, y: 1781 },
            },
        },
    },
}
