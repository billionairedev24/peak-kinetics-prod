import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HomeVisitPrep } from "@/components/home-visit-prep"

export default function PrepPage() {
    return (
        <main className="min-h-screen bg-background">
            <Header />
            <div className="pt-20">
                <HomeVisitPrep />
            </div>
            <Footer />
        </main>
    )
}
