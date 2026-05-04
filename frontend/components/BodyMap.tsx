"use client"

import React, { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Activity, ArrowRight, Zap, Heart, Target, Sparkles, RotateCcw, User, Users } from "lucide-react"
import Link from "next/link"

type View = "front" | "back"
type Sex = "male" | "female"

interface Region {
    id: string
    name: string
    icon: React.ComponentType<{ className?: string }>
    services: string[]
    description: string
    href: string
    views: View[]
    coords: Partial<Record<View, { cx: number; cy: number }>>
}

/**
 * Customer-facing region names (plain English, not anatomical terms).
 * Coordinates are in 280×560 viewBox space.
 */
const REGIONS: Region[] = [
    {
        id: "neck",
        name: "Neck",
        icon: Activity,
        services: ["Pain Management", "Posture Correction"],
        description:
            "Targeted care for neck stiffness, tension headaches, and postural strain from desk work.",
        href: "/services/pain-management",
        views: ["front", "back"],
        coords: { front: { cx: 140, cy: 80 }, back: { cx: 140, cy: 80 } },
    },
    {
        id: "shoulder-r",
        name: "Right Shoulder",
        icon: Zap,
        services: ["Sports Rehab", "Orthopedic"],
        description: "Rotator cuff tears, impingement, instability — full-spectrum shoulder rehab.",
        href: "/services/sports-rehabilitation",
        views: ["front", "back"],
        coords: { front: { cx: 190, cy: 118 }, back: { cx: 90, cy: 118 } },
    },
    {
        id: "shoulder-l",
        name: "Left Shoulder",
        icon: Zap,
        services: ["Sports Rehab", "Orthopedic"],
        description: "Rotator cuff tears, impingement, instability — full-spectrum shoulder rehab.",
        href: "/services/sports-rehabilitation",
        views: ["front", "back"],
        coords: { front: { cx: 90, cy: 118 }, back: { cx: 190, cy: 118 } },
    },
    {
        id: "chest",
        name: "Chest",
        icon: Heart,
        services: ["Sports Rehab", "Post-Surgical"],
        description: "Chest-wall pain, post-op rehab, and return to pressing/throwing activities.",
        href: "/services/sports-rehabilitation",
        views: ["front"],
        coords: { front: { cx: 140, cy: 150 } },
    },
    {
        id: "upper-back",
        name: "Upper Back",
        icon: Target,
        services: ["Posture", "Movement Screening"],
        description:
            "Mid-back mobility and posture correction — relief for desk-bound clients and athletes.",
        href: "/services/movement-screening",
        views: ["back"],
        coords: { back: { cx: 140, cy: 165 } },
    },
    {
        id: "elbow-r",
        name: "Right Elbow",
        icon: Activity,
        services: ["Tendinopathy", "Sports Rehab"],
        description: "Tennis/golfer's elbow, post-surgical recovery, return-to-throwing programs.",
        href: "/services/sports-rehabilitation",
        views: ["front", "back"],
        coords: { front: { cx: 212, cy: 210 }, back: { cx: 68, cy: 210 } },
    },
    {
        id: "elbow-l",
        name: "Left Elbow",
        icon: Activity,
        services: ["Tendinopathy", "Sports Rehab"],
        description: "Tennis/golfer's elbow, post-surgical recovery, return-to-throwing programs.",
        href: "/services/sports-rehabilitation",
        views: ["front", "back"],
        coords: { front: { cx: 68, cy: 210 }, back: { cx: 212, cy: 210 } },
    },
    {
        id: "lower-back",
        name: "Lower Back",
        icon: Target,
        services: ["Orthopedic", "Pain Management"],
        description: "Disc pain, sciatica, and post-surgical lumbar care with progressive loading.",
        href: "/services/orthopedic-therapy",
        views: ["back"],
        coords: { back: { cx: 140, cy: 248 } },
    },
    {
        id: "wrist-r",
        name: "Right Wrist & Hand",
        icon: Sparkles,
        services: ["Orthopedic", "Post-Surgical"],
        description: "Carpal tunnel, post-fracture rehab, fine-motor restoration.",
        href: "/services/orthopedic-therapy",
        views: ["front", "back"],
        coords: { front: { cx: 226, cy: 282 }, back: { cx: 54, cy: 282 } },
    },
    {
        id: "wrist-l",
        name: "Left Wrist & Hand",
        icon: Sparkles,
        services: ["Orthopedic", "Post-Surgical"],
        description: "Carpal tunnel, post-fracture rehab, fine-motor restoration.",
        href: "/services/orthopedic-therapy",
        views: ["front", "back"],
        coords: { front: { cx: 54, cy: 282 }, back: { cx: 226, cy: 282 } },
    },
    {
        id: "pelvis",
        name: "Pelvis & Tailbone",
        icon: Heart,
        services: ["Pelvic Stability", "Geriatric Care"],
        description: "Pelvic instability — postpartum, chronic pain, or post-trauma recovery.",
        href: "/services/orthopedic-therapy",
        views: ["back"],
        coords: { back: { cx: 140, cy: 295 } },
    },
    {
        id: "hip-r",
        name: "Right Hip",
        icon: Heart,
        services: ["Orthopedic", "Geriatric Care"],
        description: "Labral repair recovery, hip replacement protocol, active-lifestyle rehab.",
        href: "/services/orthopedic-therapy",
        views: ["front", "back"],
        coords: { front: { cx: 168, cy: 305 }, back: { cx: 112, cy: 305 } },
    },
    {
        id: "hip-l",
        name: "Left Hip",
        icon: Heart,
        services: ["Orthopedic", "Geriatric Care"],
        description: "Labral repair recovery, hip replacement protocol, active-lifestyle rehab.",
        href: "/services/orthopedic-therapy",
        views: ["front", "back"],
        coords: { front: { cx: 112, cy: 305 }, back: { cx: 168, cy: 305 } },
    },
    {
        id: "thigh-r",
        name: "Right Thigh",
        icon: Zap,
        services: ["Sports Rehab", "ACL Recovery"],
        description:
            "Quad and hamstring recovery — post-op ACL, patellofemoral pain, and strain rehab.",
        href: "/services/sports-rehabilitation",
        views: ["front", "back"],
        coords: { front: { cx: 168, cy: 360 }, back: { cx: 112, cy: 360 } },
    },
    {
        id: "thigh-l",
        name: "Left Thigh",
        icon: Zap,
        services: ["Sports Rehab", "ACL Recovery"],
        description:
            "Quad and hamstring recovery — post-op ACL, patellofemoral pain, and strain rehab.",
        href: "/services/sports-rehabilitation",
        views: ["front", "back"],
        coords: { front: { cx: 112, cy: 360 }, back: { cx: 168, cy: 360 } },
    },
    {
        id: "knee-r",
        name: "Right Knee",
        icon: Activity,
        services: ["ACL Recovery", "Sports Rehab"],
        description:
            "ACL and meniscus rehab, knee replacement protocol, runner's knee, return-to-sport testing.",
        href: "/services/sports-rehabilitation",
        views: ["front", "back"],
        coords: { front: { cx: 170, cy: 405 }, back: { cx: 110, cy: 405 } },
    },
    {
        id: "knee-l",
        name: "Left Knee",
        icon: Activity,
        services: ["ACL Recovery", "Sports Rehab"],
        description:
            "ACL and meniscus rehab, knee replacement protocol, runner's knee, return-to-sport testing.",
        href: "/services/sports-rehabilitation",
        views: ["front", "back"],
        coords: { front: { cx: 110, cy: 405 }, back: { cx: 170, cy: 405 } },
    },
    {
        id: "calf-r",
        name: "Right Calf",
        icon: Zap,
        services: ["Sports Rehab", "Wellness"],
        description: "Calf strain, Achilles tendon pain, and plantar fasciitis for runners.",
        href: "/services/sports-rehabilitation",
        views: ["back"],
        coords: { back: { cx: 112, cy: 450 } },
    },
    {
        id: "calf-l",
        name: "Left Calf",
        icon: Zap,
        services: ["Sports Rehab", "Wellness"],
        description: "Calf strain, Achilles tendon pain, and plantar fasciitis for runners.",
        href: "/services/sports-rehabilitation",
        views: ["back"],
        coords: { back: { cx: 168, cy: 450 } },
    },
    {
        id: "ankle-r",
        name: "Right Ankle & Foot",
        icon: Sparkles,
        services: ["Movement Screening", "Wellness"],
        description: "Ankle sprains, plantar fasciitis, gait retraining for runners and walkers.",
        href: "/services/movement-screening",
        views: ["front", "back"],
        coords: { front: { cx: 168, cy: 488 }, back: { cx: 112, cy: 488 } },
    },
    {
        id: "ankle-l",
        name: "Left Ankle & Foot",
        icon: Sparkles,
        services: ["Movement Screening", "Wellness"],
        description: "Ankle sprains, plantar fasciitis, gait retraining for runners and walkers.",
        href: "/services/movement-screening",
        views: ["front", "back"],
        coords: { front: { cx: 112, cy: 488 }, back: { cx: 168, cy: 488 } },
    },
]

interface SilhouetteGeometry {
    head: { cx: number; cy: number; rx: number; ry: number }
    neck: string
    torso: string
    armR: string
    armL: string
    legR: string
    legL: string
}

const GEOMETRY: Record<Sex, SilhouetteGeometry> = {
    male: {
        head: { cx: 140, cy: 50, rx: 30, ry: 36 },
        neck: "M 128,82 L 152,82 L 156,104 L 124,104 Z",
        torso:
            "M 114,108 L 166,108 L 190,122 L 200,150 L 202,200 L 198,260 L 192,305 L 180,330 " +
            "L 148,330 L 140,315 L 132,330 L 100,330 L 88,305 L 82,260 L 78,200 L 80,150 L 90,122 Z",
        armR:
            "M 190,122 L 214,132 L 222,200 L 226,258 L 232,294 " +
            "C 236,308 234,324 222,326 C 210,328 198,322 196,310 L 196,294 " +
            "L 198,258 L 196,200 L 192,150 Z",
        armL:
            "M 90,122 L 66,132 L 58,200 L 54,258 L 48,294 " +
            "C 44,308 46,324 58,326 C 70,328 82,322 84,310 L 84,294 " +
            "L 82,258 L 84,200 L 88,150 Z",
        legR:
            "M 180,330 L 192,370 L 190,440 L 180,490 L 182,508 L 154,508 " +
            "L 154,490 L 156,440 L 156,370 L 148,330 Z",
        legL:
            "M 100,330 L 88,370 L 90,440 L 100,490 L 98,508 L 126,508 " +
            "L 126,490 L 124,440 L 124,370 L 132,330 Z",
    },
    female: {
        head: { cx: 140, cy: 50, rx: 28, ry: 34 },
        neck: "M 130,82 L 150,82 L 154,104 L 126,104 Z",
        torso:
            "M 116,108 L 164,108 L 186,122 L 196,150 L 192,200 L 182,260 L 192,315 L 180,340 " +
            "L 148,340 L 140,325 L 132,340 L 100,340 L 88,315 L 98,260 L 88,200 L 84,150 L 94,122 Z",
        armR:
            "M 186,122 L 208,132 L 216,200 L 220,258 L 226,294 " +
            "C 230,308 228,324 216,326 C 204,328 194,322 192,310 L 192,294 " +
            "L 194,258 L 192,200 L 188,150 Z",
        armL:
            "M 94,122 L 72,132 L 64,200 L 60,258 L 54,294 " +
            "C 50,308 52,324 64,326 C 76,328 86,322 88,310 L 88,294 " +
            "L 86,258 L 88,200 L 92,150 Z",
        legR:
            "M 180,340 L 195,380 L 192,440 L 182,490 L 184,508 L 154,508 " +
            "L 154,490 L 156,440 L 158,380 L 148,340 Z",
        legL:
            "M 100,340 L 85,380 L 88,440 L 98,490 L 96,508 L 126,508 " +
            "L 126,490 L 124,440 L 122,380 L 132,340 Z",
    },
}

export function BodyMap() {
    const [view, setView] = useState<View>("front")
    const [sex, setSex] = useState<Sex>("male")
    const [activeId, setActiveId] = useState<string | null>(null)
    const [drawerOpen, setDrawerOpen] = useState(false)

    const visibleRegions = useMemo(
        () => REGIONS.filter((r) => r.views.includes(view) && r.coords[view]),
        [view],
    )
    const active = useMemo(() => REGIONS.find((r) => r.id === activeId) ?? null, [activeId])
    const geom = GEOMETRY[sex]

    const selectRegion = (id: string) => {
        setActiveId(id)
        if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
            setDrawerOpen(true)
        }
    }

    return (
        <div className="relative rounded-3xl border border-border/60 bg-card/40 p-6 md:p-10 mb-20 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,420px)_1fr] gap-10 lg:gap-16 items-start">
                {/* SVG column */}
                <div className="space-y-4">
                    <SilhouetteControls
                        view={view}
                        sex={sex}
                        onViewChange={setView}
                        onSexChange={setSex}
                    />

                    <div className="relative mx-auto w-full max-w-[400px]" style={{ aspectRatio: "280 / 560" }}>
                        <svg
                            viewBox="0 0 280 560"
                            className="w-full h-full"
                            role="img"
                            aria-label={`Body map, ${sex} ${view} view`}
                        >
                            <defs>
                                <radialGradient id="bodyBase" cx="50%" cy="30%" r="95%">
                                    <stop offset="0%" stopColor="#fde9c9" />
                                    <stop offset="55%" stopColor="#f1c79a" />
                                    <stop offset="100%" stopColor="#c9976a" />
                                </radialGradient>
                                <filter id="bodyShadow" x="-10%" y="-5%" width="120%" height="115%">
                                    <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                                    <feOffset dx="0" dy="4" result="offsetblur" />
                                    <feComponentTransfer>
                                        <feFuncA type="linear" slope="0.3" />
                                    </feComponentTransfer>
                                    <feMerge>
                                        <feMergeNode />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>

                            {/* Body silhouette */}
                            <g filter="url(#bodyShadow)" pointerEvents="none">
                                <g
                                    fill="url(#bodyBase)"
                                    stroke="#8b6b47"
                                    strokeWidth="0.8"
                                    strokeLinejoin="round"
                                >
                                    <ellipse {...geom.head} />
                                    <path d={geom.neck} />
                                    <path d={geom.torso} />
                                    <path d={geom.armR} />
                                    <path d={geom.armL} />
                                    <path d={geom.legR} />
                                    <path d={geom.legL} />
                                </g>
                            </g>

                            {/* Hotspots */}
                            {visibleRegions.map((r) => {
                                const c = r.coords[view]!
                                const isActive = activeId === r.id
                                return (
                                    <g
                                        key={r.id}
                                        className="cursor-pointer"
                                        onMouseEnter={() => setActiveId(r.id)}
                                        onClick={() => selectRegion(r.id)}
                                        role="button"
                                        aria-label={r.name}
                                    >
                                        {isActive && (
                                            <motion.circle
                                                cx={c.cx}
                                                cy={c.cy}
                                                r={5}
                                                fill="none"
                                                stroke="#1d4ed8"
                                                strokeWidth={2}
                                                initial={{ scale: 1, opacity: 0.8 }}
                                                animate={{ scale: 2.4, opacity: 0 }}
                                                transition={{
                                                    repeat: Infinity,
                                                    duration: 1.6,
                                                    ease: "easeOut",
                                                }}
                                            />
                                        )}
                                        <circle
                                            cx={c.cx}
                                            cy={c.cy}
                                            r={isActive ? 6 : 4.5}
                                            fill="#1d4ed8"
                                            fillOpacity={isActive ? 1 : 0.85}
                                            stroke="#ffffff"
                                            strokeWidth={isActive ? 2 : 1.5}
                                        />
                                    </g>
                                )
                            })}
                        </svg>
                    </div>
                </div>

                {/* Info column — desktop */}
                <div className="hidden lg:flex flex-col gap-6">
                    <div className="space-y-3">
                        <Badge
                            variant="outline"
                            className="text-primary border-primary/20 bg-primary/5 px-3 py-1 uppercase tracking-widest text-xs font-bold"
                        >
                            Body Map
                        </Badge>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                            Where does it <span className="text-primary">hurt?</span>
                        </h2>
                        <p className="text-muted-foreground max-w-lg leading-relaxed">
                            Hover any dot to see the treatment program for that area. Toggle
                            front/back to find regions on either side of the body.
                        </p>
                    </div>

                    <div className="min-h-[300px]">
                        <AnimatePresence mode="wait">
                            {active ? <RegionCard key={active.id} region={active} /> : <EmptyState />}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Mobile drawer */}
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>{active?.name ?? "Select a region"}</DrawerTitle>
                    </DrawerHeader>
                    <div className="px-4 pb-8">
                        {active ? <RegionDetails region={active} /> : null}
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    )
}

function SilhouetteControls({
    view,
    sex,
    onViewChange,
    onSexChange,
}: {
    view: View
    sex: Sex
    onViewChange: (v: View) => void
    onSexChange: (s: Sex) => void
}) {
    return (
        <div className="flex items-center justify-center gap-2 flex-wrap">
            <div className="inline-flex rounded-full border border-border bg-background p-1 text-xs font-semibold">
                <button
                    type="button"
                    onClick={() => onViewChange("front")}
                    className={`px-3 py-1.5 rounded-full transition-colors ${
                        view === "front" ? "bg-primary text-white" : "text-muted-foreground"
                    }`}
                    aria-pressed={view === "front"}
                >
                    Front
                </button>
                <button
                    type="button"
                    onClick={() => onViewChange("back")}
                    className={`px-3 py-1.5 rounded-full inline-flex items-center gap-1 transition-colors ${
                        view === "back" ? "bg-primary text-white" : "text-muted-foreground"
                    }`}
                    aria-pressed={view === "back"}
                >
                    <RotateCcw className="w-3 h-3" /> Back
                </button>
            </div>

            <div className="inline-flex rounded-full border border-border bg-background p-1 text-xs font-semibold">
                <button
                    type="button"
                    onClick={() => onSexChange("male")}
                    className={`px-3 py-1.5 rounded-full inline-flex items-center gap-1 transition-colors ${
                        sex === "male" ? "bg-primary text-white" : "text-muted-foreground"
                    }`}
                    aria-pressed={sex === "male"}
                >
                    <User className="w-3 h-3" /> Male
                </button>
                <button
                    type="button"
                    onClick={() => onSexChange("female")}
                    className={`px-3 py-1.5 rounded-full inline-flex items-center gap-1 transition-colors ${
                        sex === "female" ? "bg-primary text-white" : "text-muted-foreground"
                    }`}
                    aria-pressed={sex === "female"}
                >
                    <Users className="w-3 h-3" /> Female
                </button>
            </div>
        </div>
    )
}

function RegionCard({ region }: { region: Region }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
        >
            <Card className="border border-border/60 bg-card shadow-md">
                <CardContent className="p-6 md:p-8 space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <region.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-semibold text-foreground">
                                {region.name}
                            </h3>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {region.services.map((s) => (
                                    <span
                                        key={s}
                                        className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded"
                                    >
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <p className="text-muted-foreground leading-relaxed">{region.description}</p>

                    <Link href={region.href}>
                        <Button className="w-full">
                            View Recovery Program
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </motion.div>
    )
}

function RegionDetails({ region }: { region: Region }) {
    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-1.5">
                {region.services.map((s) => (
                    <span
                        key={s}
                        className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded"
                    >
                        {s}
                    </span>
                ))}
            </div>
            <p className="text-muted-foreground leading-relaxed">{region.description}</p>
            <Link href={region.href}>
                <Button className="w-full h-12">
                    View Recovery Program
                    <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
            </Link>
        </div>
    )
}

function EmptyState() {
    return (
        <div className="h-full min-h-[260px] flex flex-col items-center justify-center p-10 border-2 border-dashed border-border rounded-2xl bg-muted/20 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Activity className="w-7 h-7 text-primary/50" />
            </div>
            <h4 className="font-semibold text-foreground/80 mb-1">Hover a dot</h4>
            <p className="text-sm text-muted-foreground max-w-[260px]">
                Tap or hover any blue dot on the body to see the matching program.
            </p>
        </div>
    )
}
