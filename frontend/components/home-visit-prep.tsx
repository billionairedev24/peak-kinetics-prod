"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
    Home,
    Dog,
    Maximize,
    Lightbulb,
    Thermometer,
    UserCheck,
    ClipboardCheck,
    Sparkles
} from "lucide-react"

const PREP_ITEMS = [
    {
        id: "space",
        icon: Maximize,
        title: "Clear 6'x6' Area",
        description: "Please clear a small space for the treatment table and movement assessment.",
    },
    {
        id: "pets",
        icon: Dog,
        title: "Secure Pets",
        description: "For focus and safety, please keep pets in a separate room during the session.",
    },
    {
        id: "clothing",
        icon: UserCheck,
        title: "Loose Clothing",
        description: "Wear athletic wear or loose clothing that allows access to the area being treated.",
    },
    {
        id: "lighting",
        icon: Lightbulb,
        title: "Well-Lit Room",
        description: "Ensure the treatment area is well-lit for a proper physical assessment.",
    },
    {
        id: "temp",
        icon: Thermometer,
        title: "Comfortable Temp",
        description: "Keep the room at a comfortable temperature for physical activity.",
    },
    {
        id: "consent",
        icon: ClipboardCheck,
        title: "Forms Signed",
        description: "Ensure all digital intake forms are signed via your portal link.",
    }
]

export function HomeVisitPrep() {
    const [checkedItems, setCheckedItems] = useState<string[]>([])

    const toggleItem = (id: string) => {
        setCheckedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const progress = (checkedItems.length / PREP_ITEMS.length) * 100

    return (
        <div className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto space-y-12">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-wider">
                            <Home className="w-4 h-4" />
                            Patient Preparation
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
                            Ready for your <span className="text-primary underline decoration-primary/20">Home Session?</span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Follow this specialized checklist to ensure your home environment is optimized for a successful physical therapy visit.
                        </p>
                    </div>

                    <Card className="border-primary/20 shadow-2xl overflow-hidden bg-background/50 backdrop-blur-xl rounded-[2.5rem]">
                        <CardHeader className="bg-primary/5 p-8 border-b border-primary/10">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="text-2xl font-black">Visit Readiness</CardTitle>
                                    <CardDescription className="text-base font-medium">Complete these steps before the therapist arrives.</CardDescription>
                                </div>
                                <div className="hidden sm:block text-right">
                                    <p className="text-2xl font-black text-primary">{Math.round(progress)}%</p>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Complete</p>
                                </div>
                            </div>
                            <div className="h-2 w-full bg-primary/10 rounded-full mt-6 overflow-hidden">
                                <motion.div
                                    className="h-full bg-primary"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 md:p-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {PREP_ITEMS.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        className={`flex items-start gap-4 p-6 rounded-3xl border-2 transition-all cursor-pointer ${checkedItems.includes(item.id)
                                                ? "bg-primary/5 border-primary/30 shadow-lg shadow-primary/5"
                                                : "bg-white/50 border-transparent hover:border-primary/10 hover:bg-white"
                                            }`}
                                        onClick={() => toggleItem(item.id)}
                                        whileHover={{ y: -5 }}
                                    >
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${checkedItems.includes(item.id) ? "bg-primary text-white" : "bg-muted text-primary"
                                            }`}>
                                            <item.icon className="w-6 h-6" />
                                        </div>
                                        <div className="space-y-1 flex-grow">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-lg font-black leading-none cursor-pointer">{item.title}</Label>
                                                <Checkbox
                                                    checked={checkedItems.includes(item.id)}
                                                    onCheckedChange={() => toggleItem(item.id)}
                                                />
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-relaxed italic">
                                                {item.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {progress === 100 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="mt-12 p-8 bg-primary rounded-[2rem] text-white text-center shadow-2xl shadow-primary/40 flex flex-col items-center gap-4"
                                >
                                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                                        <Sparkles className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-2xl font-black">You&apos;re All Set!</h3>
                                    <p className="text-white/80 max-w-md mx-auto">
                                        Your space is perfect. Our therapist will see you at your scheduled time.
                                        Have your hydration ready and we&apos;ll handle the rest!
                                    </p>
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
