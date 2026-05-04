"use client"

import { Sparkles } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ReviewForm } from "@/components/review-form"
import Link from "next/link"

export default function ReviewFormContent() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-1 py-20 md:py-28">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto">
                        {/* Header card with gradient */}
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/70 px-8 md:px-10 pt-10 pb-20 text-white shadow-xl">
                            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
                            <div className="absolute -left-12 bottom-0 w-52 h-52 rounded-full bg-white/5 blur-3xl" />
                            <div className="relative space-y-3">
                                <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest bg-white/15 backdrop-blur rounded-full px-3 py-1 w-fit">
                                    <Sparkles className="w-3 h-3" />
                                    Share Your Experience
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                                    How was your care with Peak Kinetics?
                                </h1>
                                <p className="text-white/85 leading-relaxed max-w-lg">
                                    Your feedback helps others find the right care. Takes under a
                                    minute.
                                </p>
                            </div>
                        </div>

                        {/* Floating card with the shared form */}
                        <div className="relative -mt-12 px-6 md:px-8 pb-8 bg-card rounded-3xl border border-border shadow-lg mx-2 md:mx-6 pt-8 z-10">
                            <ReviewForm
                                successButtonLabel="Back to Home"
                                onSuccessAction={() => {
                                    window.location.href = "/"
                                }}
                                density="comfortable"
                            />
                        </div>

                        <p className="text-center text-sm text-muted-foreground mt-8">
                            By submitting this review, you agree to our{" "}
                            <Link
                                href="/privacy-policy"
                                className="text-primary hover:underline font-medium"
                            >
                                privacy policy
                            </Link>{" "}
                            and{" "}
                            <Link
                                href="/terms-of-service"
                                className="text-primary hover:underline font-medium"
                            >
                                terms of service
                            </Link>
                            .
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
