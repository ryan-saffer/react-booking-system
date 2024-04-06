import { useAuth, useOrganization } from '@clerk/clerk-react'
import { trpc } from '@utils/trpc'

export function ManageMembersTable() {
    const { organization } = useOrganization()
    const { data, isSuccess, refetch } = trpc.admin.getUsers.useQuery({ orgId: organization?.id || '' })

    // memberships?.data?.map((member) =>
    //     console.log(`metadata for ${member.publicUserData.firstName}:`, { metadata: member.publicMetadata })
    // )

    const metadataMutation = trpc.admin.addMetadata.useMutation()

    return (
        <section className="w-full">
            <h1>Manage members tables</h1>
            {isSuccess && (
                <ul>
                    {data.map((member) => {
                        console.log({ member })
                        return (
                            <li key={member.id} className="flex gap-4">
                                <p>{`${member.firstName} ${member.lastName} - ${JSON.stringify(member.publicMetadata)}`}</p>
                                <button
                                    onClick={async () => {
                                        await metadataMutation.mutateAsync({ id: member.id, orgId: organization!.id })
                                        refetch()
                                    }}
                                >
                                    Add metadata
                                </button>
                            </li>
                        )
                    })}
                </ul>
            )}
            {organization.membersCount}
        </section>
    )
}
