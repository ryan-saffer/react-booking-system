export function InventorySectionHeading({ title, description }: { title: string; description: string }) {
    return (
        <div>
            <h3 className="m-0 text-lg font-semibold text-slate-950">{title}</h3>
            <p className="m-0 text-sm text-slate-500">{description}</p>
        </div>
    )
}
