import type { ComponentPropsWithoutRef } from 'react'

export const markdownComponents = {
    h1: (props: ComponentPropsWithoutRef<'h1'>) => (
        <h1 className="mt-4 text-2xl font-extrabold text-slate-900" {...props} />
    ),
    h2: (props: ComponentPropsWithoutRef<'h2'>) => <h2 className="mt-4 text-xl font-bold text-[#b14592]" {...props} />,
    h3: (props: ComponentPropsWithoutRef<'h3'>) => (
        <h3 className="mt-3 text-lg font-semibold text-[#FF4F9C]" {...props} />
    ),
    p: (props: ComponentPropsWithoutRef<'p'>) => (
        <p className="mb-3 text-base leading-relaxed text-slate-700" {...props} />
    ),
    ul: (props: ComponentPropsWithoutRef<'ul'>) => (
        <ul
            className="mb-3 list-disc space-y-1 pl-5 text-base leading-relaxed text-slate-700 marker:font-bold marker:text-slate-800"
            {...props}
        />
    ),
    ol: (props: ComponentPropsWithoutRef<'ol'>) => (
        <ol
            className="mb-3 list-decimal space-y-1 pl-5 text-base leading-relaxed text-slate-700 marker:font-bold marker:text-slate-800"
            {...props}
        />
    ),
    li: (props: ComponentPropsWithoutRef<'li'>) => (
        <li className="text-base leading-relaxed text-slate-700" {...props} />
    ),
    blockquote: (props: ComponentPropsWithoutRef<'blockquote'>) => (
        <blockquote
            className="my-2 border-l-4 border-[#4bc5d9] bg-slate-50 px-4 py-2 text-sm text-slate-600"
            {...props}
        />
    ),
    img: (props: ComponentPropsWithoutRef<'img'>) => (
        <img className="my-3 w-[250px] rounded-[10px] border-[5px] border-[#4bc5d9] shadow-md" {...props} />
    ),
}
