"use client"

import { useEffect, useRef } from "react"

declare global {
    interface Window {
        turnstile?: {
            render: (
                el: HTMLElement,
                options: {
                    sitekey: string
                    callback: (token: string) => void
                    "expired-callback"?: () => void
                    "error-callback"?: () => void
                    theme?: "light" | "dark" | "auto"
                    size?: "normal" | "compact" | "invisible"
                },
            ) => string
            reset: (widgetId?: string) => void
            remove: (widgetId: string) => void
        }
    }
}

interface TurnstileProps {
    onToken: (token: string) => void
    theme?: "light" | "dark" | "auto"
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
const SCRIPT_ID = "cf-turnstile-script"

/**
 * Renders a Cloudflare Turnstile widget. If NEXT_PUBLIC_TURNSTILE_SITE_KEY
 * is not set, renders nothing and immediately fires onToken('') so dev/preview
 * builds without a key still let the form submit (backend will accept empty
 * tokens when its secret-key is also unset).
 */
export function Turnstile({ onToken, theme = "auto" }: TurnstileProps) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const widgetIdRef = useRef<string | null>(null)

    useEffect(() => {
        if (!SITE_KEY) {
            onToken("")
            return
        }

        let cancelled = false

        const render = () => {
            if (cancelled || !containerRef.current || !window.turnstile) return
            widgetIdRef.current = window.turnstile.render(containerRef.current, {
                sitekey: SITE_KEY,
                callback: (token) => onToken(token),
                "expired-callback": () => onToken(""),
                "error-callback": () => onToken(""),
                theme,
            })
        }

        if (window.turnstile) {
            render()
        } else if (!document.getElementById(SCRIPT_ID)) {
            const s = document.createElement("script")
            s.id = SCRIPT_ID
            s.src = SCRIPT_SRC
            s.async = true
            s.defer = true
            s.onload = render
            document.head.appendChild(s)
        } else {
            const t = setInterval(() => {
                if (window.turnstile) {
                    clearInterval(t)
                    render()
                }
            }, 100)
            return () => clearInterval(t)
        }

        return () => {
            cancelled = true
            if (widgetIdRef.current && window.turnstile) {
                window.turnstile.remove(widgetIdRef.current)
                widgetIdRef.current = null
            }
        }
    }, [onToken, theme])

    if (!SITE_KEY) return null
    return <div ref={containerRef} className="my-3" />
}
