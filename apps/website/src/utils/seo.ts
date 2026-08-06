import { getPublicStudio, PUBLIC_STUDIOS, type PublicStudioSlug } from './studios'

export type JsonLd = Record<string, unknown>

export const SITE_URL = 'https://www.fizzkidz.com.au'

const organizationId = `${SITE_URL}/#organization`
const websiteId = `${SITE_URL}/#website`

export function absoluteUrl(path: string) {
    return new URL(path, SITE_URL).toString()
}

const organizationSchema: JsonLd = {
    '@type': 'Organization',
    '@id': organizationId,
    name: 'Fizz Kidz',
    url: SITE_URL,
    logo: absoluteUrl('/images/logo-horizontal.png'),
    image: absoluteUrl('/open-graph/home.jpg'),
    email: 'bookings@fizzkidz.com.au',
    telephone: '+61390598144',
    sameAs: ['https://www.instagram.com/fizzkidzz/'],
}

const websiteSchema: JsonLd = {
    '@type': 'WebSite',
    '@id': websiteId,
    name: 'Fizz Kidz',
    url: SITE_URL,
    inLanguage: 'en-AU',
    publisher: { '@id': organizationId },
}

export function createBreadcrumbSchema(path: string, items: { name: string; path: string }[]): JsonLd {
    return {
        '@type': 'BreadcrumbList',
        '@id': `${absoluteUrl(path)}#breadcrumb`,
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: absoluteUrl(item.path),
        })),
    }
}

export function createServiceSchema({
    name,
    description,
    path,
    serviceType,
    areaServed = ['Melbourne', 'Geelong', 'Victoria'],
    providerId = organizationId,
}: {
    name: string
    description: string
    path: string
    serviceType: string
    areaServed?: string[]
    providerId?: string
}): JsonLd {
    const url = absoluteUrl(path)

    return {
        '@type': 'Service',
        '@id': `${url}#service`,
        name,
        description,
        serviceType,
        url,
        mainEntityOfPage: url,
        provider: { '@id': providerId },
        areaServed: areaServed.map((name) => ({ '@type': 'Place', name })),
    }
}

export function createPartySchemas({
    name,
    description,
    slug,
}: {
    name: string
    description: string
    slug: string
}): JsonLd[] {
    const path = `/birthday-parties/${slug}/`

    return [
        createServiceSchema({
            name,
            description,
            path,
            serviceType: 'Kids birthday party',
        }),
        createBreadcrumbSchema(path, [
            { name: 'Home', path: '/' },
            { name: 'Birthday Parties', path: '/birthday-parties/' },
            { name, path },
        ]),
    ]
}

export function createLocalBusinessSchema(slug: PublicStudioSlug): JsonLd {
    const studio = getPublicStudio(slug)
    const url = absoluteUrl(`/locations/${studio.slug}/`)

    return {
        '@type': 'EntertainmentBusiness',
        '@id': `${url}#business`,
        name: `Fizz Kidz ${studio.name}`,
        url,
        mainEntityOfPage: url,
        ...('image' in studio ? { image: absoluteUrl(studio.image) } : {}),
        email: 'bookings@fizzkidz.com.au',
        telephone: '+61390598144',
        parentOrganization: { '@id': organizationId },
        address: {
            '@type': 'PostalAddress',
            streetAddress: studio.streetAddress,
            addressLocality: studio.addressLocality,
            addressRegion: 'VIC',
            postalCode: studio.postalCode,
            addressCountry: 'AU',
        },
    }
}

export function createLocationSchemas(slug: PublicStudioSlug): JsonLd[] {
    const studio = getPublicStudio(slug)
    const path = `/locations/${studio.slug}/`
    const businessId = `${absoluteUrl(path)}#business`
    const areaServed = [...new Set([studio.name, studio.addressLocality])]

    return [
        createLocalBusinessSchema(slug),
        createServiceSchema({
            name: `Kids birthday parties and holiday programs at Fizz Kidz ${studio.name}`,
            description: `Creative kids birthday parties, school holiday programs and hands-on activities at Fizz Kidz ${studio.name}.`,
            path,
            serviceType: 'Kids birthday party venue and school holiday program',
            areaServed,
            providerId: businessId,
        }),
        createBreadcrumbSchema(path, [
            { name: 'Home', path: '/' },
            { name: 'Locations', path: '/locations/' },
            { name: studio.name, path },
        ]),
    ]
}

export function createLocationsListSchema(): JsonLd {
    return {
        '@type': 'ItemList',
        '@id': `${absoluteUrl('/locations/')}#locations`,
        name: 'Fizz Kidz studio locations',
        itemListElement: PUBLIC_STUDIOS.map((studio, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: `Fizz Kidz ${studio.name}`,
            item: absoluteUrl(`/locations/${studio.slug}/`),
        })),
    }
}

export function createSchemaGraph({
    path,
    title,
    description,
    items = [],
}: {
    path: string
    title: string
    description: string
    items?: JsonLd[]
}): JsonLd {
    const url = absoluteUrl(path)
    const breadcrumb = items.find((item) => item['@type'] === 'BreadcrumbList')

    return {
        '@context': 'https://schema.org',
        '@graph': [
            organizationSchema,
            websiteSchema,
            {
                '@type': 'WebPage',
                '@id': `${url}#webpage`,
                url,
                name: title,
                description,
                inLanguage: 'en-AU',
                isPartOf: { '@id': websiteId },
                about: { '@id': organizationId },
                ...(breadcrumb ? { breadcrumb: { '@id': breadcrumb['@id'] } } : {}),
            },
            ...items,
        ],
    }
}
