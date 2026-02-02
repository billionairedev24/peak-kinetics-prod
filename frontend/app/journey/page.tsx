import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PatientJourneyDashboard } from "@/components/patient-journey-dashboard"

export default function JourneyPage() {
    return (
        <main className="min-h-screen bg-background">
            <Header />
            <div className="pt-20">
                <PatientJourneyDashboard />
            </div>
            <Footer />
        </main>
    )
}
