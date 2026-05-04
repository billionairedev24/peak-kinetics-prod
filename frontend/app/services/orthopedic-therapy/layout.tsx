import type { Metadata } from "next"
import { SERVICES, SITE } from "@/lib/site"

const SERVICE = SERVICES.find((s) => s.slug === "orthopedic-therapy")!

export const metadata: Metadata = {
    title: `${SERVICE.title} — ${SITE.name}`,
    description: SERVICE.description,
    alternates: { canonical: `${SITE.url}/services/${SERVICE.slug}` },
    openGraph: {
        title: `${SERVICE.title} — ${SITE.name}`,
        description: SERVICE.description,
        url: `${SITE.url}/services/${SERVICE.slug}`,
        type: "article",
    },
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return children
}
