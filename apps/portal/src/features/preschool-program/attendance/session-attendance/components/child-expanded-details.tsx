import { useMutation } from '@tanstack/react-query'
import { ExternalLink, Loader2, Mail, Phone, ShieldAlert, UserRound } from 'lucide-react'
import { toast } from 'sonner'

import type { AcuityTypes } from '@fizz-kidz/core'

import { useTRPC } from '@integrations/trpc'
import { Alert, AlertDescription, AlertTitle } from '@shared/components/ui/alert'
import { Button } from '@shared/components/ui/button'

import { getPreschoolAttendanceDetails } from '../utils/acuity-attendance'

export function ChildExpandedDetails({ appointment }: { appointment: AcuityTypes.Api.Appointment }) {
    const trpc = useTRPC()
    const details = getPreschoolAttendanceDetails(appointment)
    const planMutation = useMutation(
        trpc.preschoolProgramV2.getAnaphylaxisPlanUrl.mutationOptions({
            onError: () => toast.error('Unable to open the anaphylaxis plan'),
        })
    )

    async function openAnaphylaxisPlan() {
        if (!details.anaphylaxisPlanPath) return
        const planWindow = window.open('', '_blank')

        try {
            const url = await planMutation.mutateAsync({ storagePath: details.anaphylaxisPlanPath })
            if (planWindow) {
                planWindow.opener = null
                planWindow.location.href = url
            } else {
                window.open(url, '_blank', 'noopener,noreferrer')
            }
        } catch {
            planWindow?.close()
        }
    }

    return (
        <div className="space-y-4 bg-muted/20 p-4 sm:p-6">
            {details.allergies || details.isAnaphylactic ? (
                <Alert variant="destructive">
                    <ShieldAlert className="size-4" />
                    <AlertTitle>
                        {details.isAnaphylactic ? 'Anaphylaxis and allergy information' : 'Allergy information'}
                    </AlertTitle>
                    <AlertDescription className="mt-2 space-y-3 whitespace-pre-wrap">
                        {details.allergies || 'Anaphylactic child. Review the plan before sign-in.'}
                        {details.anaphylaxisPlanPath ? (
                            <div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={openAnaphylaxisPlan}
                                    disabled={planMutation.isPending}
                                >
                                    {planMutation.isPending ? (
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                    ) : (
                                        <ExternalLink className="mr-2 size-4" />
                                    )}
                                    View anaphylaxis plan
                                </Button>
                            </div>
                        ) : null}
                    </AlertDescription>
                </Alert>
            ) : null}

            {details.additionalInfo ? (
                <Alert>
                    <AlertTitle>Additional information</AlertTitle>
                    <AlertDescription className="mt-2 whitespace-pre-wrap">{details.additionalInfo}</AlertDescription>
                </Alert>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
                <DetailSection title="Parent details" icon={<UserRound className="size-4" />}>
                    <Detail label="Name" value={details.parentName} />
                    <Detail
                        label="Phone"
                        value={
                            details.parentPhone ? (
                                <a
                                    className="inline-flex items-center gap-1 text-blue-700 underline"
                                    href={`tel:${details.parentPhone}`}
                                >
                                    <Phone className="size-3.5" /> {details.parentPhone}
                                </a>
                            ) : (
                                '—'
                            )
                        }
                    />
                    <Detail
                        label="Email"
                        value={
                            details.parentEmail ? (
                                <a
                                    className="inline-flex items-center gap-1 break-all text-blue-700 underline"
                                    href={`mailto:${details.parentEmail}`}
                                >
                                    <Mail className="size-3.5" /> {details.parentEmail}
                                </a>
                            ) : (
                                '—'
                            )
                        }
                    />
                </DetailSection>

                <DetailSection title="Emergency contact" icon={<ShieldAlert className="size-4" />}>
                    <Detail label="Name" value={details.emergencyContactName || '—'} />
                    <Detail label="Relation" value={details.emergencyContactRelation || '—'} />
                    <Detail
                        label="Phone"
                        value={
                            details.emergencyContactPhone ? (
                                <a
                                    className="inline-flex items-center gap-1 text-blue-700 underline"
                                    href={`tel:${details.emergencyContactPhone}`}
                                >
                                    <Phone className="size-3.5" /> {details.emergencyContactPhone}
                                </a>
                            ) : (
                                '—'
                            )
                        }
                    />
                </DetailSection>
            </div>
        </div>
    )
}

function DetailSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <section className="rounded-lg border bg-background p-4 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 font-semibold">
                {icon} {title}
            </h3>
            <dl className="space-y-2 text-sm">{children}</dl>
        </section>
    )
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="grid grid-cols-[7rem_1fr] gap-2">
            <dt className="text-muted-foreground">{label}</dt>
            <dd>{value}</dd>
        </div>
    )
}
