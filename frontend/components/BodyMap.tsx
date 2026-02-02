"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, ArrowRight, Zap, Heart, Target, Sparkles } from "lucide-react"
import Link from "next/link"

const BODY_PARTS = [
    {
        id: "neck",
        name: "Cervical & Neck",
        icon: Activity,
        services: ["Pain Management", "Posture Correction"],
        description: "Specialized care for chronic neck pain, stiffness, and tension headaches.",
        cx: "110",
        cy: "45",
        href: "/services/pain-management",
    },
    {
        id: "shoulders",
        name: "Shoulder & Upper Arm",
        icon: Zap,
        services: ["Sports Rehabilitation", "Orthopedic Therapy"],
        description: "Recovery for rotator cuff tears, impingement, and athletic instability.",
        cx: "75",
        cy: "75",
        href: "/services/sports-rehabilitation",
    },
    {
        id: "back",
        name: "Lumbar & Spine",
        icon: Target,
        services: ["Orthopedic Therapy", "Movement Screening"],
        description: "Targeted decompression and strengthening for lower back and spinal health.",
        cx: "110",
        cy: "130",
        href: "/services/orthopedic-therapy",
    },
    {
        id: "hips",
        name: "Hip & Pelvis",
        icon: Heart,
        services: ["Geriatric Care", "Orthopedic Therapy"],
        description: "Restoring mobility and reducing pain in hip joints and surrounding tissue.",
        cx: "110",
        cy: "180",
        href: "/services/orthopedic-therapy",
    },
    {
        id: "knees",
        name: "Knee & ACL",
        icon: Activity,
        services: ["Sports Rehabilitation", "ACL Recovery"],
        description: "Elite-level rehabilitation for ligament injuries and joint wear.",
        cx: "90",
        cy: "270",
        href: "/services/sports-rehabilitation",
    },
    {
        id: "feet",
        name: "Ankle & Foot",
        icon: Sparkles,
        services: ["Movement Screening", "Wellness Program"],
        description: "Correcting biomechanical flaws from the ground up to prevent injury.",
        cx: "85",
        cy: "370",
        href: "/services/movement-screening",
    },
]

export function BodyMap() {
    const [activePart, setActivePart] = useState<(typeof BODY_PARTS)[0] | null>(null)

    return (
        <div className="relative glass-card overflow-hidden rounded-[2.5rem] border border-white/20 bg-gradient-to-br from-white/5 to-white/10 p-8 md:p-12 mb-20 shadow-2xl">
            <div className="absolute top-0 right-0 p-8 text-primary/10 pointer-events-none">
                <Activity className="w-64 h-64 rotate-12" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
                {/* SVG Container */}
                <div className="relative aspect-[3/4] max-w-sm mx-auto w-full group">
                    <svg viewBox="0 0 220 400" className="w-full h-full drop-shadow-[0_20px_50px_rgba(14,165,233,0.3)] filter">
                        <defs>
                            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#f8fafc" />
                                <stop offset="100%" stopColor="#cbd5e1" />
                            </linearGradient>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* Human Silhouette - More detailed path */}
                        <path
                            d="M110,15 C130,15 145,30 145,50 C145,70 130,85 110,85 C90,85 75,70 75,50 C75,30 90,15 110,15 M110,85 L110,105 M70,105 L150,105 L165,190 L145,190 L135,115 L110,115 L85,115 L75,190 L55,190 L70,105 M110,210 L110,230 M90,230 L75,390 L105,390 L110,290 L115,390 L145,390 L130,230 L90,230"
                            fill="url(#bodyGradient)"
                            stroke="#94a3b8"
                            strokeWidth="0.5"
                            className="transition-all duration-700"
                        />

                        {/* Hotspots */}
                        {BODY_PARTS.map((part) => (
                            <g
                                key={part.id}
                                className="cursor-pointer"
                                onMouseEnter={() => setActivePart(part)}
                                onClick={() => setActivePart(part)}
                            >
                                <motion.circle
                                    cx={part.cx}
                                    cy={part.cy}
                                    r="6"
                                    className={activePart?.id === part.id ? "fill-primary" : "fill-primary/20"}
                                    animate={{
                                        scale: activePart?.id === part.id ? [1, 1.3, 1] : 1,
                                    }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    filter="url(#glow)"
                                />
                                <circle
                                    cx={part.cx}
                                    cy={part.cy}
                                    r="15"
                                    fill="transparent"
                                    className="hover:stroke-primary/30 hover:stroke-[3]"
                                />
                            </g>
                        ))}
                    </svg>

                    {/* Desktop Pulse Tooltip Hints */}
                    {!activePart && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none animate-bounce">
                            <p className="text-primary text-sm font-bold bg-white/80 backdrop-blur px-3 py-1 rounded-full shadow-lg border border-primary/20">
                                Explore Hotspots
                            </p>
                        </div>
                    )}
                </div>

                {/* Info Column */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 px-4 py-1.5 text-sm uppercase tracking-widest font-bold">
                            Anatomical Map
                        </Badge>
                        <h2 className="text-5xl font-black tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                            Personalized <span className="text-primary">Pathways</span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                            We focus on the root cause of your pain. Hover over the interactive map to discover specialized treatment programs for your specific needs.
                        </p>
                    </div>

                    <div className="relative min-h-[320px]">
                        <AnimatePresence mode="wait">
                            {activePart ? (
                                <motion.div
                                    key={activePart.id}
                                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                    className="w-full"
                                >
                                    <Card className="border-0 bg-white/10 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden">
                                        <CardContent className="p-8">
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                                                    <activePart.icon className="w-7 h-7 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-bold text-foreground">{activePart.name}</h3>
                                                    <div className="flex gap-2 mt-1">
                                                        {activePart.services.map((s) => (
                                                            <span key={s} className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">
                                                                {s}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                                                {activePart.description}
                                            </p>

                                            <Link href={activePart.href}>
                                                <Button className="w-full h-14 text-lg bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 group rounded-xl">
                                                    View Recovery Program
                                                    <ArrowRight className="ml-3 w-5 h-5 transition-transform group-hover:translate-x-2" />
                                                </Button>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="h-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-primary/20 rounded-[2rem] bg-primary/5 text-center group"
                                >
                                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                        <Activity className="w-10 h-10 text-primary/40" />
                                    </div>
                                    <h4 className="text-xl font-bold text-foreground/60 mb-2">Targeted Therapy Discovery</h4>
                                    <p className="text-muted-foreground text-sm max-w-[250px]">
                                        Use the Anatomical Map to select an area of concern and reveal targeted solutions.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    )
}
