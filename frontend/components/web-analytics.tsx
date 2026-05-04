"use client"

import Script from "next/script"

const TOKEN = process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN

/**
 * Cloudflare Web Analytics beacon. No-op when the token isn't set
 * so dev/preview builds without analytics still work.
 *
 * Privacy: CF Web Analytics is cookieless and doesn't fingerprint visitors.
 */
export function WebAnalytics() {
    if (!TOKEN) return null
    return (
        <Script
            id="cf-web-analytics"
            strategy="afterInteractive"
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({ token: TOKEN })}
        />
    )
}
