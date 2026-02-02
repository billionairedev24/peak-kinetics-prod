"use client"

import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Milestone,
    CheckCircle2,
    Circle,
    Activity,
    Calendar,
    ChevronRight,
    TrendingUp,
    BrainCircuit
} from "lucide-react"

const PHASES = [
    {
        name: "Acute Phase",
        status: "completed",
        description: "Inflammation reduction & pain management.",
        icon: Activity
    },
    {
        name: "Mobility & Range",
        status: "current",
        description: "Restoring functional movement patterns.",
        icon: BrainCircuit
    },
    {
        name: "Strength & Loading",
        status: "upcoming",
        description: "Progressive tissue loading & tissue capacity.",
        icon: TrendingUp
    },
    {
        name: "Performance",
        status: "upcoming",
        description: "Return to sport/activity specific drills.",
        icon: Milestone
    }
]

export function PatientJourneyDashboard({ journey }: { journey?: any }) {
    // Default data for demo if no journey prop provided
    const data = journey || {
        patientName: "John Doe",
        currentPhase: "Mobility & Range",
        progressPercentage: 45,
        description: "You're making great progress in restoring hip mobility. We'll start incorporating light resistance next week.",
        nextMilestone: "90° Active Hip Flexion",
        nextMilestoneDate: "January 25, 2026"
    }

    return (
        <div className="py-24 bg-background relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-5xl mx-auto space-y-10">
                    {/* Header Card */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <Badge variant="outline" className="text-primary border-primary/20 px-3 py-1 font-bold">
                                PATIENT PORTAL
                            </Badge>
                            <h2 className="text-5xl font-black tracking-tight">
                                Your <span className="text-primary italic">Recovery</span> Journey
                            </h2>
                            <p className="text-muted-foreground text-xl font-medium">Welcome back, {data.patientName}. Here is your current status.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left: Current Status & Progress */}
                        <div className="lg:col-span-2 space-y-8">
                            <Card className="border-primary/20 shadow-2xl bg-white/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                                <CardHeader className="bg-primary p-8 text-white">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <CardTitle className="text-3xl font-black">Overall Progress</CardTitle>
                                            <CardDescription className="text-white/80 font-medium">Phase 2 of 4</CardDescription>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-4xl font-black">{data.progressPercentage}%</p>
                                        </div>
                                    </div>
                                    <Progress value={data.progressPercentage} className="h-3 bg-white/20 mt-6" />
                                </CardHeader>
                                <CardContent className="p-8 md:p-12 space-y-8">
                                    <div className="space-y-4">
                                        <h3 className="text-2xl font-black flex items-center gap-3">
                                            <Activity className="text-primary" />
                                            Current Focus: {data.currentPhase}
                                        </h3>
                                        <p className="text-lg text-muted-foreground leading-relaxed italic border-l-4 border-primary/20 pl-6 py-2 bg-muted/30 rounded-r-2xl">
                                            &quot;{data.description}&quot;
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                        <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 space-y-2">
                                            <div className="flex items-center gap-2 text-primary">
                                                <Milestone className="w-5 h-5" />
                                                <span className="text-sm font-black uppercase tracking-widest">Next Milestone</span>
                                            </div>
                                            <p className="text-xl font-black">{data.nextMilestone}</p>
                                        </div>
                                        <div className="p-6 rounded-3xl bg-secondary/5 border border-secondary/10 space-y-2">
                                            <div className="flex items-center gap-2 text-secondary-foreground">
                                                <Calendar className="w-5 h-5" />
                                                <span className="text-sm font-black uppercase tracking-widest">Target Date</span>
                                            </div>
                                            <p className="text-xl font-black">{data.nextMilestoneDate}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Phase Timeline */}
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black px-2">Path to Performance</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {PHASES.map((phase, index) => (
                                        <motion.div
                                            key={phase.name}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`p-6 rounded-3xl border-2 transition-all flex items-center justify-between ${phase.status === 'completed' ? "bg-primary/5 border-primary/30" :
                                                phase.status === 'current' ? "bg-white border-primary shadow-xl ring-4 ring-primary/10" :
                                                    "bg-muted/50 border-transparent opacity-60"
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${phase.status === 'completed' || phase.status === 'current' ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                                                    }`}>
                                                    <phase.icon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className={`font-black ${phase.status === 'current' ? "text-primary text-lg" : "text-foreground"}`}>
                                                        {phase.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground font-medium">{phase.description}</p>
                                                </div>
                                            </div>
                                            {phase.status === 'completed' && <CheckCircle2 className="text-primary w-6 h-6" />}
                                            {phase.status === 'current' && <ChevronRight className="text-primary w-6 h-6 animate-pulse" />}
                                            {phase.status === 'upcoming' && <Circle className="text-muted-foreground w-6 h-6" />}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right: Quick Links / Tips */}
                        <div className="space-y-8">
                            <Card className="border-none shadow-xl bg-slate-900 text-white rounded-[2.5rem] overflow-hidden">
                                <CardContent className="p-8 space-y-6">
                                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                                        <TrendingUp className="text-primary w-6 h-6" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-xl font-black">Therapeutic Tip</h4>
                                        <p className="text-white/70 text-sm leading-relaxed">
                                            Consistency is the key to neurological adaptation. Even 5 minutes of your mobility drills today will make tomorrow&apos;s session significantly more effective.
                                        </p>
                                    </div>
                                    <Button className="w-full bg-white text-slate-900 hover:bg-white/90 rounded-2xl font-black">
                                        View Exercise Library
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="border-primary/10 bg-white rounded-[2.5rem] overflow-hidden shadow-lg">
                                <CardHeader className="p-6 pb-2">
                                    <CardTitle className="text-lg font-black uppercase tracking-widest text-muted-foreground">Recent Activity</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 pt-0 space-y-4">
                                    {[
                                        "Home Visit Completed (Jan 15)",
                                        "Mobility Assessment (Jan 10)",
                                        "Intake Analysis (Jan 08)"
                                    ].map((activity, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/50 transition-colors cursor-pointer">
                                            <div className="w-2 h-2 rounded-full bg-primary" />
                                            <span className="text-sm font-semibold">{activity}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
