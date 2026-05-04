import type { MetadataRoute } from "next"
import { SERVICES, SITE } from "@/lib/site"

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" },
    { path: "/blog", priority: 0.7, changeFrequency: "weekly" },
    { path: "/journey", priority: 0.7, changeFrequency: "monthly" },
    { path: "/review", priority: 0.5, changeFrequency: "yearly" },
    { path: "/prep-guide", priority: 0.6, changeFrequency: "monthly" },
    { path: "/privacy-policy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/terms-of-service", priority: 0.3, changeFrequency: "yearly" },
]

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date()
    const staticUrls = STATIC_ROUTES.map((r) => ({
        url: `${SITE.url}${r.path}`,
        lastModified: now,
        changeFrequency: r.changeFrequency,
        priority: r.priority,
    }))
    const serviceUrls = SERVICES.map((s) => ({
        url: `${SITE.url}/services/${s.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.8,
    }))
    return [...staticUrls, ...serviceUrls]
}
