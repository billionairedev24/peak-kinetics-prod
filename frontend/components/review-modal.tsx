"use client"

import { Sparkles } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ReviewForm, type NewReview } from "./review-form"

interface ReviewModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit?: (review: NewReview) => void
}

export function ReviewModal({ isOpen, onClose, onSubmit }: ReviewModalProps) {
    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose()
            }}
        >
            <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden border-0 shadow-2xl">
                {/* Gradient header */}
                <div className="relative bg-gradient-to-br from-primary to-primary/70 px-8 pt-8 pb-20 text-white">
                    <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute -left-10 bottom-0 w-40 h-40 rounded-full bg-white/5 blur-3xl" />
                    <DialogHeader className="relative space-y-2">
                        <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest bg-white/15 backdrop-blur rounded-full px-3 py-1 w-fit">
                            <Sparkles className="w-3 h-3" />
                            Share Your Experience
                        </div>
                        <DialogTitle className="text-2xl md:text-3xl font-bold leading-tight">
                            How was your care with Peak Kinetics?
                        </DialogTitle>
                        <p className="text-white/85 text-sm">
                            Your feedback helps others find the right care. Takes under a minute.
                        </p>
                    </DialogHeader>
                </div>

                {/* Form floats into the header */}
                <div className="px-8 -mt-12 pb-8 max-h-[70vh] overflow-y-auto relative z-10">
                    <ReviewForm
                        onSuccess={onSubmit}
                        onCancel={onClose}
                        successButtonLabel="Done"
                        onSuccessAction={onClose}
                        density="compact"
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}
