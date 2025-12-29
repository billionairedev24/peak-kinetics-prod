"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Calendar, Phone, ChevronDown, Shield } from "lucide-react"
import { cn } from "@/lib/utils"
import { SchedulingIframeModal } from "./scheduling-iframe-modal"
import { useScheduling } from "./scheduling-context"
import Link from "next/link"

function LogoComponent() {
  return (
      <div className="flex items-center gap-3">
        {/* Logo Box */}
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
          <span className="text-white font-bold text-2xl">PK</span>
        </div>

        {/* Text Section */}
        <div className="flex flex-col gap-0.5">
          <p className="text-base font-bold text-foreground leading-tight">Peak Kinetics</p>
          <p className="text-xs text-muted-foreground font-medium leading-tight">Physical Therapy</p>
        </div>
      </div>
  )
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false)
  const { isOpen: isSchedulingOpen, open: openScheduling, close: closeScheduling } = useScheduling()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add("mobile-menu-open")
    } else {
      document.body.classList.remove("mobile-menu-open")
    }

    return () => {
      document.body.classList.remove("mobile-menu-open")
    }
  }, [isMenuOpen])

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/#services", label: "Services", hasDropdown: true },
    { href: "/#about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/#contact", label: "Contact" },
  ]

  const services = [
    { name: "Sports Rehabilitation", href: "/#services" },
    { name: "Orthopedic Therapy", href: "/#services" },
    { name: "Pain Management", href: "/#services" },
    { name: "Movement Screening", href: "/#services" },
    { name: "Geriatric Care", href: "/#services" },
    { name: "Wellness Program", href: "/#services" },
  ]

  const handleBookAppointment = () => {
    openScheduling()
  }

  return (
      <>
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
                isScrolled
                    ? "bg-background/95 backdrop-blur-xl shadow-2xl border-b border-primary/20"
                    : "bg-background/80 backdrop-blur-md shadow-lg",
            )}
        >
          <nav className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Logo Section */}
              <div className="flex-shrink-0">
                <Link href="/">
                  <LogoComponent />
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-10">
                {navItems.map((item) => (
                    <div key={item.href} className="relative group">
                      {item.hasDropdown ? (
                          <div
                              className="relative"
                              onMouseEnter={() => setIsServicesDropdownOpen(true)}
                              onMouseLeave={() => setIsServicesDropdownOpen(false)}
                          >
                            <Link
                                href={item.href}
                                className="text-foreground hover:text-primary transition-all duration-300 font-semibold text-sm flex items-center gap-1 py-2"
                            >
                              {item.label}
                              <ChevronDown
                                  className={cn(
                                      "h-4 w-4 transition-transform duration-200",
                                      isServicesDropdownOpen && "rotate-180",
                                  )}
                              />
                              <span className="absolute -bottom-1 left-0 w-0 h-1 bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300 group-hover:w-full"></span>
                            </Link>

                            {/* Services Dropdown */}
                            <div
                                className={cn(
                                    "absolute top-full left-0 mt-2 w-64 bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-primary/20 py-4 transition-all duration-300 transform",
                                    isServicesDropdownOpen
                                        ? "opacity-100 visible translate-y-0"
                                        : "opacity-0 invisible -translate-y-2",
                                )}
                            >
                              <div className="px-4 pb-2 mb-2 border-b border-border/50">
                                <h3 className="font-semibold text-foreground text-sm">Our Services</h3>
                              </div>
                              {services.map((service, index) => (
                                  <Link
                                      key={service.name}
                                      href={service.href}
                                      className="block px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200 rounded-lg mx-2"
                                      style={{ animationDelay: `${index * 50}ms` }}
                                  >
                                    {service.name}
                                  </Link>
                              ))}
                            </div>
                          </div>
                      ) : (
                          <Link
                              href={item.href}
                              className="text-foreground hover:text-primary transition-all duration-300 font-semibold text-sm relative py-2"
                          >
                            {item.label}
                            <span className="absolute -bottom-1 left-0 w-0 h-1 bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300 group-hover:w-full"></span>
                          </Link>
                      )}
                    </div>
                ))}
              </div>

              {/* Desktop CTA Section */}
              <div className="hidden lg:flex items-center gap-6">
                <a
                    href="tel:737-368-2653"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-primary/5 transition-all duration-300 whitespace-nowrap"
                >
                  <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-bold text-foreground">737-368-2653</p>
                    <p className="text-xs text-muted-foreground">24/7</p>
                  </div>
                </a>
                <Link
                    href="/admin"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/15 transition-all duration-300 whitespace-nowrap group border border-primary/20"
                >
                  <Shield className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-semibold text-primary transition-colors">Admin</span>
                </Link>
                <Button className="cta-button px-8 py-2.5 flex-shrink-0" onClick={handleBookAppointment}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Appointment
                </Button>
              </div>

              {/* Mobile Actions */}
              <div className="flex lg:hidden items-center gap-2">
                <Link
                    href="/admin"
                    className="p-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 transition-all duration-300"
                    aria-label="Admin portal"
                >
                  <Shield className="h-6 w-6 text-primary" />
                </Link>
                <a
                    href="tel:737-368-2653"
                    className="p-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 transition-all duration-300"
                    aria-label="Call us"
                >
                  <Phone className="h-6 w-6 text-primary" />
                </a>
                <Button size="sm" className="cta-button px-3 py-2" onClick={handleBookAppointment}>
                  <Calendar className="h-4 w-4" />
                </Button>
                <button
                    className="p-2.5 rounded-xl hover:bg-primary/10 transition-all duration-300"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                  {isMenuOpen ? <X className="h-6 w-6 text-foreground" /> : <Menu className="h-6 w-6 text-foreground" />}
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="mobile-menu lg:hidden">
                  <div className="container mx-auto px-6 py-8 h-full overflow-y-auto">
                    <div className="flex flex-col space-y-6 min-h-full justify-center">
                      {navItems.map((item, index) => (
                          <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => {
                                setIsMenuOpen(false)
                              }}
                              className="mobile-menu-item animate-slide-in-left text-center"
                              style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            {item.label}
                          </Link>
                      ))}
                      <Link
                          href="/admin"
                          onClick={() => setIsMenuOpen(false)}
                          className="mobile-menu-item animate-slide-in-left text-center text-primary"
                          style={{ animationDelay: `${navItems.length * 0.1}s` }}
                      >
                        Admin Portal
                      </Link>
                      <div
                          className="pt-8 border-t border-border/50 animate-slide-in-left"
                          style={{ animationDelay: "0.4s" }}
                      >
                        <div className="flex items-center justify-center gap-4 mb-6">
                          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <Phone className="h-6 w-6 text-primary" />
                          </div>
                          <div className="text-left">
                            <p className="text-xl font-bold text-foreground">737-368-2653</p>
                            <p className="text-sm text-muted-foreground">Call Anytime</p>
                          </div>
                        </div>
                        <Button
                            className="cta-button w-full py-4 text-lg"
                            onClick={() => {
                              handleBookAppointment()
                              setIsMenuOpen(false)
                            }}
                        >
                          <Calendar className="h-5 w-5 mr-2" />
                          Schedule Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
            )}
          </nav>
        </header>

        <SchedulingIframeModal isOpen={isSchedulingOpen} onClose={closeScheduling} />
      </>
  )
}