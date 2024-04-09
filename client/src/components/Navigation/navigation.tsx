import { Link } from 'react-router-dom'

import { useOrg } from '@components/Session/use-org'

import styles from './navigation.module.css'

export const Navigation = () => {
    const { hasPermission } = useOrg()

    return (
        <div className="twp flex h-full justify-center bg-slate-100 p-4">
            <div className="flex w-full max-w-lg flex-col gap-5">
                <h2 className="lilita text-2xl">Programs</h2>
                <ListItem
                    title="Parties, Events & Incursions"
                    to="bookings"
                    imgSrc="https://fizzkidz.com.au/wp-content/uploads/elementor/thumbs/FizzKidz-76-scaled-e1645523582564-pkvrc29l4f5in86v327lhv2aavc71eult9zjc8i5cw.jpeg"
                />
                <ListItem
                    title="Holiday Programs"
                    to="holiday-program"
                    imgSrc="https://fizzkidz.com.au/wp-content/uploads/2022/03/FizzKidz-Summerhill-31-e1646805910671.jpeg"
                />
                <ListItem
                    title="After School Program"
                    to="after-school-program"
                    imgSrc="https://fizzkidz.com.au/wp-content/uploads/elementor/thumbs/Layer-8-p1e4mkgqstj3hgrx8atpwyesp9t7itb3hckcjgopls.jpg"
                />
                <h2 className="lilita text-2xl">Creations</h2>
                <ListItem
                    title="Creation Instructions"
                    to="creations"
                    imgSrc="https://fizzkidz.com.au/wp-content/uploads/elementor/thumbs/Sparkling-Lipbalm-1-p29wcmsmucie25b40xgtewic1carr2pe9ubfd1yvew.png"
                />
                <h2 className="lilita text-2xl">Useful Links</h2>
                <ListItem
                    imgSrc="https://fizzkidz.com.au/wp-content/uploads/elementor/thumbs/FizzKidz-Summerhill-65-pw3n3aq1pb8clofid1rqavdu8dtp2qs8c4dle4xllk.jpeg"
                    title="Incident Reporting"
                    onClick={() =>
                        window.open(
                            'https://docs.google.com/forms/d/e/1FAIpQLSecOuuZ-k6j5z04aurXcgHrrak6I91wwePK57mVqlvyaib9qQ/viewform',
                            '_blank'
                        )
                    }
                />
                {/* {(isAdmin || canAccessPayroll) && */}
                {/* <> */}
                {hasPermission('admin') && (
                    <>
                        <h2 className="lilita text-2xl">Admin</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
            <h4 className="gotham font-bold">{title}</h4>
        </Link>
    )
}
