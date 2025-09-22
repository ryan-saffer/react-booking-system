import { Link } from 'react-router-dom'

import { useOrg } from '@components/Session/use-org'
import afterSchool from '@drawables/after-school.webp'
import bodyGlitter from '@drawables/body-glitter.webp'
import energy from '@drawables/energy.webp'
import holidayPrograms from '@drawables/holiday-programs.webp'
import jonah from '@drawables/jonah.webp'
import kingsville from '@drawables/kingsville.webp'
import parties from '@drawables/parties.webp'

import styles from './navigation.module.css'

export const Navigation = () => {
    const { hasPermission } = useOrg()

    return (
        <div className="twp mb-8 flex h-full justify-center bg-slate-100 p-4">
            <div className="flex w-full max-w-lg flex-col">
                <h2 className="lilita mb-3 mt-8 text-2xl">Programs</h2>
                <div className="flex flex-col gap-3">
                    <ListItem title="Parties, Events & Incursions" to="bookings" imgSrc={parties} />
                    <ListItem
                        title="Holiday Programs"
                        to={`holiday-program?id=${import.meta.env.VITE_ENV === 'prod' ? '11036399' : '15026605'}`}
                        imgSrc={holidayPrograms}
                    />
                    <ListItem title="Play Lab" to={'play-lab'} imgSrc={kingsville} />
                    <ListItem title="After School Program" to="after-school-program" imgSrc={afterSchool} />
                </div>
                <h2 className="lilita mb-3 mt-8 text-2xl">Creations</h2>
                <ListItem title="Creation Instructions" to="creations" imgSrc={bodyGlitter} />
                <h2 className="lilita mb-3 mt-8 text-2xl">Useful Links</h2>
                <div className="flex flex-col gap-3">
                    <ListItem
                        imgSrc={energy}
                        title="Incident Reporting"
                        onClick={() =>
                            window.open(
                                'https://docs.google.com/forms/d/e/1FAIpQLSecOuuZ-k6j5z04aurXcgHrrak6I91wwePK57mVqlvyaib9qQ/viewform',
                                '_blank'
                            )
                        }
                    />
                    <ListItem
                        imgSrc={jonah}
                        title="Behaviour Management Plan"
                        onClick={() =>
                            window.open(
                                'https://www.fizzkidz.com.au/holiday-programs-behaviour-management-plan.pdf',
                                '_blank'
                            )
                        }
                    />
                </div>
                {hasPermission('admin') && (
                    <>
                        <h2 className="lilita mb-3 mt-8 text-2xl">Admin</h2>
                        <div className="flex flex-col gap-3">
                            <ListItem
                                title="After School Program Invoicing"
                                to="after-school-program-invoicing"
                                imgSrc="https://api.dicebear.com/7.x/icons/svg?icon=envelope&scale=70&backgroundColor=E91171"
                            />
                            <ListItem
                                title="Payroll"
                                to="payroll"
                                imgSrc="https://api.dicebear.com/7.x/icons/svg?icon=cashCoin&scale=70&backgroundColor=4BC5D9&translateY=5"
                            />
                            <ListItem
                                title="Onboarding"
                                to="onboarding"
                                imgSrc="https://api.dicebear.com/7.x/icons/svg?icon=signpost2&scale=70&backgroundColor=9ECC48"
                            />
                            <ListItem
                                title="Discount Codes"
                                to="discount-codes"
                                imgSrc="https://api.dicebear.com/7.x/icons/svg?icon=ticketPerforated&scale=70&backgroundColor=B14594"
                            />
                            <ListItem
                                title="School Zone Map"
                                to="after-school-program-map"
                                imgSrc="https://api.dicebear.com/7.x/icons/svg?icon=map&scale=70&backgroundColor=F6BA34"
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

function ListItem({
    title,
    to,
    imgSrc,
    onClick,
}: {
    title: string
    to?: string
    imgSrc: string
    onClick?: () => void
}) {
    return (
        <Link to={to || ''} className={styles.listItem} onClick={onClick}>
            <img src={imgSrc} width={80} alt={`${title} icon`} />
            <h4 className="font-light">{title}</h4>
        </Link>
    )
}
