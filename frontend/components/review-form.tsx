"use client"

import type React from "react"
import { useCallback, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Loader2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Turnstile } from "@/components/turnstile"
import { API_ENDPOINTS } from "@/lib/api-config"
import type { Review } from "./reviews-section"

export type NewReview = Omit<Review, "id" | "date">

interface ReviewFormProps {
    /** Called after a successful submission (after the thank-you panel mounts) */
    onSuccess?: (review: NewReview) => void
    /** Cancel button — shown only when provided (useful in modals) */
    onCancel?: () => void
    /** Text for the success panel's trailing action button */
    successButtonLabel?: string
    /** Called when the success panel's action button is clicked */
    onSuccessAction?: () => void
    /** Render density: "compact" for modals, "comfortable" for full-page */
    density?: "compact" | "comfortable"
}

const RATING_LABELS = ["Terrible", "Poor", "Fair", "Good", "Excellent"] as const
const MIN_REVIEW = 20
const MAX_REVIEW = 2000

export function ReviewForm({
    onSuccess,
    onCancel,
    successButtonLabel = "Done",
    onSuccessAction,
    density = "compact",
}: ReviewFormProps) {
    const [rating, setRating] = useState(5)
    const [hovered, setHovered] = useState(0)
    const [name, setName] = useState("")
    const [role, setRole] = useState("")
    const [text, setText] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [turnstileToken, setTurnstileToken] = useState("")
    const onTurnstile = useCallback((t: string) => setTurnstileToken(t), [])

    const activeStars = hovered || rating
    const charCount = text.trim().length
    const canSubmit =
        name.trim().length > 0 &&
        charCount >= MIN_REVIEW &&
        charCount <= MAX_REVIEW &&
        !submitting

    const comfy = density === "comfortable"

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!canSubmit) return

        setSubmitting(true)
        setError(null)

        try {
            const response = await fetch(API_ENDPOINTS.reviews.create, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(turnstileToken ? { "Cf-Turnstile-Response": turnstileToken } : {}),
                },
                body: JSON.stringify({
                    name: name.trim(),
                    role: role.trim() || "Patient",
                    rating,
                    text: text.trim(),
                    fullText: text.trim(),
                    image: "/placeholder.svg",
                }),
            })

            const result = await response.json().catch(() => ({}))

            if (!response.ok || result.success === false) {
                setError(result.message || "Could not submit your review. Please try again.")
                setSubmitting(false)
                return
            }

            const newReview: NewReview = {
                name: name.trim(),
                role: role.trim() || "Patient",
                image: "/placeholder.svg",
                rating,
                text: text.trim(),
                fullText: text.trim(),
                treatment: "Local Review",
            }

            setSubmitted(true)
            setSubmitting(false)
            onSuccess?.(newReview)
        } catch (err) {
            console.error("Review submit error:", err)
            setError("Network error. Please try again.")
            setSubmitting(false)
        }
    }

    const ratingLabel = useMemo(
        () => (activeStars > 0 ? RATING_LABELS[activeStars - 1] : "Rate your experience"),
        [activeStars],
    )

    return (
        <AnimatePresence mode="wait" initial={false}>
            {submitted ? (
                <SuccessPanel
                    key="success"
                    buttonLabel={successButtonLabel}
                    onAction={onSuccessAction}
                    density={density}
                />
            ) : (
                <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className={comfy ? "space-y-8" : "space-y-5"}
                >
                    {/* Rating */}
                    <div
                        className={
                            comfy
                                ? "rounded-2xl border border-border p-6 bg-card shadow-sm"
                                : "bg-card border border-border rounded-2xl shadow-lg p-5"
                        }
                    >
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Your rating
                            </label>
                            <span
                                className={`text-sm font-semibold ${
                                    activeStars >= 4
                                        ? "text-primary"
                                        : activeStars > 0
                                          ? "text-foreground/70"
                                          : "text-muted-foreground"
                                }`}
                            >
                                {ratingLabel}
                            </span>
                        </div>
                        <div
                            className={comfy ? "flex gap-2 justify-center" : "flex gap-1"}
                            onMouseLeave={() => setHovered(0)}
                            role="radiogroup"
                            aria-label="Rating"
                        >
                            {[1, 2, 3, 4, 5].map((s) => {
                                const filled = s <= activeStars
                                return (
                                    <button
                                        key={s}
                                        type="button"
                                        role="radio"
                                        aria-checked={rating === s}
                                        aria-label={`${s} star${s === 1 ? "" : "s"}`}
                                        onClick={() => setRating(s)}
                                        onMouseEnter={() => setHovered(s)}
                                        className="p-1 transition-transform hover:scale-125 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                                    >
                                        <Star
                                            className={`${comfy ? "w-10 h-10" : "w-8 h-8"} transition-colors ${
                                                filled
                                                    ? "fill-yellow-400 stroke-yellow-500"
                                                    : "fill-transparent stroke-muted-foreground/40"
                                            }`}
                                        />
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Fields */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="Your name" required>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Alex Johnson"
                                maxLength={100}
                                autoFocus
                                className="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </Field>
                        <Field label="What you do (optional)">
                            <input
                                type="text"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                placeholder="Runner, Mom, Teacher…"
                                maxLength={80}
                                className="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </Field>
                    </div>

                    <Field label="Your review" required>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="What stood out about your experience? Who would you recommend Peak Kinetics to?"
                            rows={comfy ? 6 : 5}
                            maxLength={MAX_REVIEW}
                            className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm leading-relaxed resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[120px]"
                        />
                        <div className="flex items-center justify-between mt-2 text-xs">
                            <span
                                className={
                                    charCount > 0 && charCount < MIN_REVIEW
                                        ? "text-amber-600"
                                        : "text-muted-foreground"
                                }
                            >
                                {charCount < MIN_REVIEW
                                    ? `${MIN_REVIEW - charCount} more characters needed`
                                    : "Looks good"}
                            </span>
                            <span className="text-muted-foreground tabular-nums">
                                {charCount} / {MAX_REVIEW}
                            </span>
                        </div>
                    </Field>

                    <Turnstile onToken={onTurnstile} />

                    {error && (
                        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    <div className="flex items-center gap-3 pt-2">
                        {onCancel && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onCancel}
                                disabled={submitting}
                                className="flex-1 sm:flex-none"
                            >
                                Cancel
                            </Button>
                        )}
                        <Button
                            type="submit"
                            disabled={!canSubmit}
                            className={comfy ? "flex-1 h-12 text-base" : "flex-1 h-11"}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Submitting…
                                </>
                            ) : (
                                "Submit Review"
                            )}
                        </Button>
                    </div>

                    <p className="text-[11px] text-center text-muted-foreground">
                        Reviews are moderated before they appear on the site.
                    </p>
                </motion.form>
            )}
        </AnimatePresence>
    )
}

function Field({
    label,
    required,
    children,
}: {
    label: string
    required?: boolean
    children: React.ReactNode
}) {
    return (
        <label className="block">
            <span className="block text-xs font-bold uppercase tracking-wider text-foreground/70 mb-2">
                {label}
                {required && <span className="text-primary ml-1">*</span>}
            </span>
            {children}
        </label>
    )
}

function SuccessPanel({
    buttonLabel,
    onAction,
    density,
}: {
    buttonLabel: string
    onAction?: () => void
    density: "compact" | "comfortable"
}) {
    const comfy = density === "comfortable"
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className={comfy ? "py-10 text-center space-y-6" : "py-6 text-center space-y-5"}
        >
            <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.05 }}
                className={`${comfy ? "w-24 h-24" : "w-20 h-20"} rounded-full bg-primary/10 flex items-center justify-center mx-auto`}
            >
                <CheckCircle2
                    className={`${comfy ? "w-14 h-14" : "w-11 h-11"} text-primary`}
                />
            </motion.div>
            <div className="space-y-2">
                <h3 className={`font-bold text-foreground ${comfy ? "text-3xl" : "text-2xl"}`}>
                    Thank you!
                </h3>
                <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
                    Your review has been submitted. We'll publish it after a quick moderation
                    check — typically within 24 hours.
                </p>
            </div>
            {onAction && (
                <Button onClick={onAction} className="w-full sm:w-auto px-8">
                    {buttonLabel}
                </Button>
            )}
        </motion.div>
    )
}
