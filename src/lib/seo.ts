import type { Crumb } from '~/components/Breadcrumbs.astro';

export function absoluteUrl(path: string, site: URL | undefined): string {
  if (!site) throw new Error('`site` is not configured — set SITE_URL or the default in astro.config.mjs');
  return new URL(path, site).href;
}

export function breadcrumbJsonLd(items: Crumb[], site: URL | undefined) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      item: absoluteUrl(item.href, site),
    })),
  };
}

/** Serialise JSON-LD safely for embedding in a <script> tag. */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}
