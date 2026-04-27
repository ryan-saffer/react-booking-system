import { useState } from 'react'

import Loader from '@components/Shared/Loader'

export const TerritoryMappingPage = () => {
    const [isLoading, setIsLoading] = useState(true)

    return (
        <div className="relative h-full w-full">
            {isLoading && (
                <div className="absolute inset-0 z-10">
                    <Loader />
                    <p className="absolute left-1/2 top-[calc(50%+30px)] -translate-x-1/2 text-sm text-slate-500">
                        Loading mapping data...
                    </p>
                </div>
            )}
            <iframe
                src="//mangomap.com/fizz-kidz/maps/ae74a744-5aa0-11ef-a22c-02af6ed49e2d?preview=true"
                width="100%"
                height="100%"
                className={isLoading ? 'opacity-0' : 'opacity-100'}
                onLoad={() => setIsLoading(false)}
            ></iframe>
        </div>
    )
}
