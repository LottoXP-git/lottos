/**
 * Build a Schema.org BreadcrumbList JSON-LD object.
 * Pass an ordered array of crumbs (root → current page).
 */
export function buildBreadcrumb(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export const SITE_URL = "https://lottos.lovable.app";