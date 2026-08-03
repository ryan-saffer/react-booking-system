import type { ImageMetadata } from 'astro'

export type StoryblokImage = {
    src: string
    width: number
    height: number
    assetId: number
}

export type ImageSource = ImageMetadata | StoryblokImage
