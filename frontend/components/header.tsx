"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Calendar, Phone, ChevronDown, Shield, Activity, Heart, Target, Zap, Milestone, Home } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { SchedulingIframeModal } from "./scheduling-iframe-modal"
import { useScheduling } from "./scheduling-context"
import Link from "next/link"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false)
  const { isOpen: isSchedulingOpen, open: openScheduling, close: closeScheduling } = useScheduling()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/#services", label: "Services", hasDropdown: true },
    { href: "/#about", label: "About" },
    { href: "/journey", label: "My Journey" },
    { href: "/prep-guide", label: "Prep Guide" },
    { href: "/blog", label: "Blog" },
    { href: "/#contact", label: "Contact" },
  ]

  const servicesList = [
    { name: "Sports Rehabilitation", href: "/services/sports-rehabilitation", icon: Activity },
    { name: "Orthopedic Therapy", href: "/services/orthopedic-therapy", icon: Heart },
    { name: "Pain Management", href: "/services/pain-management", icon: Target },
    { name: "Movement Screening", href: "/services/movement-screening", icon: Zap },
    { name: "Geriatric Care", href: "/services/geriatric-care", icon: Heart },
    { name: "Wellness Program", href: "/services/wellness-program", icon: Activity },
  ]

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full",
          isScrolled
            ? "bg-white/80 backdrop-blur-xl border-b border-black/5 shadow-sm"
            : "bg-white border-b border-transparent"
        )}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-20 overflow-visible">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-4 group">
              <div className="w-11 h-11 bg-[#2b59e1] rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(43,89,225,0.25)] group-hover:scale-105 transition-transform duration-300">
                <span className="text-white font-bold text-xl tracking-tight">PK</span>
              </div>
              <div className="flex flex-col">
                <p className="text-[17px] font-bold text-[#1a1a1a] tracking-tight leading-none mb-1">Peak Kinetics</p>
                <p className="text-[11px] font-medium text-[#666] leading-none">Physical Therapy</p>
              </div>
            </Link>

            {/* Desktop Nav - Centered */}
            <div className="hidden lg:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
              {navItems.filter(item => ["Home", "Services", "About", "Blog", "Contact"].includes(item.label)).map((item) => (
                <div key={item.label} className="relative group">
                  {item.hasDropdown ? (
                    <div
                      onMouseEnter={() => setIsServicesDropdownOpen(true)}
                      onMouseLeave={() => setIsServicesDropdownOpen(false)}
                      className="relative py-2"
                    >
                      <Link
                        href={item.href}
                        className="text-[14px] font-bold text-[#1a1a1a]/70 hover:text-[#2b59e1] transition-colors flex items-center gap-1.5"
                      >
                        {item.label}
                        <ChevronDown className={cn("w-4 h-4 transition-transform duration-300 opacity-60", isServicesDropdownOpen && "rotate-180")} />
                      </Link>

                      {/* Dropdown */}
                      <AnimatePresence>
                        {isServicesDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-white border border-[#eee] rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] p-3 grid gap-1 z-[60]"
                          >
                            {servicesList.map((service) => (
                              <Link
                                key={service.name}
                                href={service.href}
                                className="group/item flex items-center gap-3.5 p-3 rounded-xl hover:bg-[#2b59e1]/5 transition-all"
                              >
                                <div className="w-8 h-8 rounded-lg bg-[#2b59e1]/5 flex items-center justify-center group-hover/item:bg-[#2b59e1] transition-colors">
                                  <service.icon className="w-4 h-4 text-[#2b59e1] group-hover/item:text-white" />
                                </div>
                                <span className="text-[13px] font-bold text-[#444] group-hover/item:text-[#2b59e1]">
                                  {service.name}
                                </span>
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-[14px] font-bold text-[#1a1a1a]/70 hover:text-[#2b59e1] transition-colors py-2 block relative group"
                    >
                      {item.label}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#2b59e1] transition-all duration-300 group-hover:w-full rounded-full" />
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-5">
              <div className="hidden xl:flex items-center gap-3.5 mr-2">
                <div className="w-10 h-10 rounded-full bg-[#2b59e1]/5 flex items-center justify-center">
                  <Phone className="w-4.5 h-4.5 text-[#2b59e1]" />
                </div>
                <div className="flex flex-col">
                  <a href="tel:737-368-2653" className="text-[15px] font-bold text-[#1a1a1a] hover:text-[#2b59e1] transition-colors leading-none mb-1">
                    737-368-2653
                  </a>
                  <p className="text-[10px] font-semibold text-[#888] tracking-wider uppercase leading-none">24/7</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link href="/admin" className="hidden md:flex items-center gap-2 text-[13px] font-bold text-[#2b59e1] hover:bg-[#2b59e1]/5 px-4 py-2.5 rounded-xl border border-[#2b59e1]/20 transition-all">
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>

                <Button
                  onClick={() => openScheduling()}
                  className="rounded-xl px-6 py-3 h-12 text-[14px] font-bold bg-[#2b59e1] hover:bg-[#1e48c7] text-white shadow-[0_8px_20px_rgba(43,89,225,0.2)] transition-all flex items-center gap-2.5"
                >
                  <Calendar className="w-4.5 h-4.5" />
                  Schedule Appointment
                </Button>

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="lg:hidden w-11 h-11 flex items-center justify-center rounded-xl bg-[#f5f5f5] text-[#1a1a1a] hover:bg-[#2b59e1]/10 hover:text-[#2b59e1] transition-all"
                >
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Fullscreen Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 bg-background/98 backdrop-blur-2xl lg:hidden flex flex-col p-8 pt-32"
          >
            <div className="flex flex-col gap-6">
              {navItems.map((item, i) => (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={item.label}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-4xl font-black text-foreground hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Link
                  href="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-2xl font-black text-primary flex items-center gap-2 mt-8"
                >
                  <Shield className="w-6 h-6" />
                  ADMIN PORTAL
                </Link>
              </motion.div>
            </div>

            <div className="mt-auto space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-black text-foreground">737.368.2653</p>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Call or Text Anytime</p>
                </div>
              </div>
              <Button onClick={() => { openScheduling(); setIsMenuOpen(false); }} className="w-full h-16 text-xl font-black rounded-3xl bg-primary shadow-2xl shadow-primary/30">
                BOOK EVALUATION
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SchedulingIframeModal isOpen={isSchedulingOpen} onClose={closeScheduling} />
    </>
  )
}