import type { GetImageResult } from "astro";

export type CustomImage = {
  image: GetImageResult;
  alt: string;
};
