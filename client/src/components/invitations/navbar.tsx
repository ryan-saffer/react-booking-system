import clsx from 'clsx'

export const Navbar = ({ shadow }: { shadow: boolean }) => {
    return (
        <div
            className={clsx('z-[999] flex h-16 w-full justify-center border-b border-gray-200 bg-white', {
                'shadow-md': shadow,
            })}
        >
            <img src="/fizz-logo.png" className="m-1 w-32"></img>
        </div>
    )
}
