export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const publicSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://nexautia-droid.github.io/nexautia-ecommerce-template";

export function publicAsset(path: string) {
  return `${basePath}${path}`;
}
