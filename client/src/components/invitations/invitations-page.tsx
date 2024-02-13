import * as Logo from '@drawables/fizz-logo.png'

import { CreateInvitationSidebar } from './create-invitation-sidebar'

// import { Invitation } from './invitation'

export const CreateInvitationPage = () => {
    return (
        <>
            <div className="flex justify-center shadow-xl">
                <img src={Logo.default} className="m-1 w-32"></img>
            </div>
            <div className="mx-auto flex max-w-5xl flex-col p-8 min-[630px]:mr-[240px]">
                <div className=" flex flex-col justify-evenly gap-12 min-[900px]:flex-row">
                    <div className="mt-6 flex flex-col gap-6">
                        <h1 className="font-lilita text-4xl">Fizz Kidz Invitations</h1>
                        <h2 className="font-lilita text-xl text-[#9044E2]">
                            We have designed a bunch of unique invitation options specially for you!
                        </h2>
                        <p>
                            Just browse the options below, and click the download button for the location where you are
                            having the party! Each invitation includes the studios address at the bottom.
                        </p>
                    </div>
                    <div>
                        <img
                            src="https://fizzkidz.com.au/wp-content/uploads/2021/01/party.jpg"
                            className="shadow-purple w-[1300px] rounded-3xl"
                        ></img>
                    </div>
                </div>
                <h1 className="font-lilita mt-12 text-center text-4xl">Invitations</h1>
                {/* <Invitation invitationUrl="https://fizzkidz.com.au/wp-content/uploads/2024/02/Mobile-Invitation-Option-1.png" /> */}
            </div>
            <CreateInvitationSidebar />
        </>
    )
}
