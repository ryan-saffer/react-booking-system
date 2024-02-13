import * as Logo from '@drawables/fizz-logo.png'
import { useMediaQuery } from '@mui/material'

import { CreateInvitationSidebar } from './create-invitation-sidebar'

export const CreateInvitation = () => {
    const isMobile = useMediaQuery('(max-width: 630px)')
    return (
        <>
            <div className="sticky flex justify-center shadow-xl">
                <img src={Logo.default} className="m-1 w-32"></img>
            </div>
            <div className="mx-auto flex h-full flex-col bg-orange-300 p-8 min-[630px]:mr-[240px]">
                <div className="relative h-max">
                    {isMobile ? (
                        <img
                            src="https://fizzkidz.com.au/wp-content/uploads/2024/02/Mobile-Invitation-Option-1.png"
                            className="absolute z-50 h-auto w-auto rounded-xl"
                        />
                    ) : (
                        <>
                            <img
                                src="https://fizzkidz.com.au/wp-content/uploads/2024/02/Mobile-Invitation-Option-1.png"
                                className="absolute z-50 ml-[40px] mt-[50px] max-w-[250px] rounded-xl object-contain min-[550px]:max-w-[300px] min-[860px]:max-w-[500px] min-[1100px]:ml-[30%]"
                            />
                            <img
                                src="https://fizzkidz.com.au/wp-content/uploads/2024/02/Envelope-1.png"
                                className="absolute z-20 ml-[100px] mt-[200px] max-w-[200px] rounded-3xl object-contain min-[550px]:max-w-[400px] min-[860px]:max-w-[700px] min-[1100px]:ml-[40%]"
                            />
                        </>
                    )}
                </div>
            </div>
            <CreateInvitationSidebar />
        </>
    )
}
